-- Fix the function search path security issue
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

-- Fix the calculate totals function search path
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
$$ LANGUAGE plpgsql SET search_path = public;