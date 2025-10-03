-- Create expenses table for tracking costs
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  vat_deductible BOOLEAN NOT NULL DEFAULT true,
  vat_amount_cents INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "Contractors can view their expenses"
  ON public.expenses FOR SELECT
  USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can create their expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update their expenses"
  ON public.expenses FOR UPDATE
  USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete their expenses"
  ON public.expenses FOR DELETE
  USING (contractor_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment_intent_id to invoices for Stripe integration
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;