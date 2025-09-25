-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL,
  client_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0, -- in cents
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00, -- VAT percentage (0, 9, 21)
  vat_amount_cents INTEGER NOT NULL DEFAULT 0, -- calculated VAT in cents
  total_cents INTEGER NOT NULL DEFAULT 0, -- total including VAT in cents
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_terms TEXT DEFAULT '14 dagen',
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  ubl_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT
);

-- Create invoice_line_items table
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  time_entry_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL, -- hours or units
  unit_price_cents INTEGER NOT NULL, -- price per hour/unit in cents
  total_cents INTEGER NOT NULL, -- quantity * unit_price in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (time_entry_id) REFERENCES public.time_entries(id) ON DELETE SET NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TIME_ENTRY_SUBMITTED', 'TIME_ENTRY_APPROVED', 'TIME_ENTRY_REJECTED', 'INVOICE_SENT', 'INVOICE_PAID', 'INVOICE_OVERDUE')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin settings table for invoice configuration
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL UNIQUE,
  invoice_prefix TEXT DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  default_payment_terms TEXT DEFAULT '14 dagen',
  default_vat_rate DECIMAL(5,2) DEFAULT 21.00,
  company_logo_url TEXT,
  invoice_template_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Contractors can manage their invoices" ON public.invoices
FOR ALL USING (contractor_id = auth.uid());

-- RLS policies for invoice line items (through invoice relationship)
CREATE POLICY "Access through invoice ownership" ON public.invoice_line_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND invoices.contractor_id = auth.uid()
  )
);

-- RLS policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for admin settings
CREATE POLICY "Contractors can manage their settings" ON public.admin_settings
FOR ALL USING (contractor_id = auth.uid());

-- Add update triggers
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number(contractor_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  settings_record public.admin_settings;
  new_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get or create settings for contractor
  SELECT * INTO settings_record 
  FROM public.admin_settings 
  WHERE contractor_id = contractor_uuid;
  
  IF NOT FOUND THEN
    INSERT INTO public.admin_settings (contractor_id, invoice_prefix, next_invoice_number)
    VALUES (contractor_uuid, 'INV', 1)
    RETURNING * INTO settings_record;
  END IF;
  
  -- Generate invoice number
  new_number := settings_record.next_invoice_number;
  invoice_number := settings_record.invoice_prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(new_number::TEXT, 3, '0');
  
  -- Update next invoice number
  UPDATE public.admin_settings 
  SET next_invoice_number = next_invoice_number + 1 
  WHERE contractor_id = contractor_uuid;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(total_cents), 0)
  INTO NEW.subtotal_cents
  FROM public.invoice_line_items
  WHERE invoice_id = NEW.id;
  
  -- Calculate VAT
  NEW.vat_amount_cents := ROUND(NEW.subtotal_cents * NEW.vat_rate / 100);
  
  -- Calculate total
  NEW.total_cents := NEW.subtotal_cents + NEW.vat_amount_cents;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate invoice totals
CREATE TRIGGER calculate_invoice_totals_trigger
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.calculate_invoice_totals();

-- Create indexes for performance
CREATE INDEX idx_invoices_contractor_id ON public.invoices(contractor_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_admin_settings_contractor_id ON public.admin_settings(contractor_id);