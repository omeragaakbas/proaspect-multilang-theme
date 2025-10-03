-- Create audit_logs table for tracking all important actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'ADMIN'::app_role));

-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  vat_rate numeric DEFAULT 21.00,
  payment_terms text DEFAULT '14 dagen',
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_templates
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- Contractors can manage their own templates
CREATE POLICY "Contractors can manage their templates"
ON public.invoice_templates
FOR ALL
USING (contractor_id = auth.uid());

-- Create index
CREATE INDEX IF NOT EXISTS idx_invoice_templates_contractor ON public.invoice_templates(contractor_id);

-- Create backup_exports table for data export functionality
CREATE TABLE IF NOT EXISTS public.backup_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type text NOT NULL, -- 'full', 'invoices', 'time_entries', 'clients', etc.
  file_url text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.backup_exports ENABLE ROW LEVEL SECURITY;

-- Users can manage their own exports
CREATE POLICY "Users can manage their exports"
ON public.backup_exports
FOR ALL
USING (user_id = auth.uid());

-- Create index
CREATE INDEX IF NOT EXISTS idx_backup_exports_user ON public.backup_exports(user_id, created_at DESC);

-- Add session tracking columns to profiles for security monitoring
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_login_ip inet,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until timestamp with time zone;