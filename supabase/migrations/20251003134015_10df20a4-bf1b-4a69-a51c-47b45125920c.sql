-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'CONTRACTOR',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Only contractor owners can manage invitations
CREATE POLICY "Contractors can manage their invitations"
ON public.team_invitations
FOR ALL
USING (contractor_id = auth.uid());

-- Client access to invoices (for client portal)
CREATE TABLE IF NOT EXISTS public.client_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, email)
);

ALTER TABLE public.client_access_tokens ENABLE ROW LEVEL SECURITY;

-- Contractors can manage their client access tokens
CREATE POLICY "Contractors can manage client access"
ON public.client_access_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_access_tokens.client_id 
    AND clients.contractor_id = auth.uid()
  )
);

-- Add team_id to contractor_profiles for team management
ALTER TABLE public.contractor_profiles
ADD COLUMN IF NOT EXISTS team_owner_id UUID REFERENCES auth.users(id);

-- Update invoices policies to support client portal access
CREATE POLICY "Clients can view their invoices via token"
ON public.invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_access_tokens cat
    WHERE cat.client_id = invoices.client_id
    AND cat.token = current_setting('app.client_token', true)
    AND (cat.expires_at IS NULL OR cat.expires_at > now())
  )
);

-- Add approval fields to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS client_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS client_approved_by TEXT;