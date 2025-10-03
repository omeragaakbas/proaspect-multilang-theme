-- Add notification preferences to contractor profiles
ALTER TABLE public.contractor_profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "invoice_sent": true,
  "invoice_viewed": true,
  "invoice_paid": true,
  "invoice_overdue": true,
  "payment_reminder": true,
  "time_entry_approved": true,
  "time_entry_rejected": true,
  "team_invitation": true
}'::jsonb;

-- Add reminder tracking to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_reminder_at timestamp with time zone;

-- Create index for overdue invoice checks
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date) WHERE status IN ('SENT', 'VIEWED');

-- Create index for reminder queries
CREATE INDEX IF NOT EXISTS idx_invoices_reminder ON public.invoices(due_date, reminder_sent_at) WHERE status IN ('SENT', 'VIEWED');