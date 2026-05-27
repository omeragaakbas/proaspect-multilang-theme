-- ============================================================
-- ProAspect Database Schema
-- SaaS platform voor ZZP'ers: tijdregistratie + facturatie
-- ============================================================

-- 1. ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('ADMIN', 'CONTRACTOR');
CREATE TYPE public.locale AS ENUM ('nl', 'en', 'tr');
CREATE TYPE public.ui_theme AS ENUM ('LIGHT', 'DARK', 'SYSTEM');


-- 2. TABLES (ordered by FK dependencies)
-- ============================================================

-- profiles: user profile (auth-linked)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  preferred_locale public.locale DEFAULT 'nl',
  ui_theme public.ui_theme DEFAULT 'SYSTEM',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- user_roles: role assignments
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'CONTRACTOR',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
);

-- contractor_profiles: business details for ZZP'ers
CREATE TABLE public.contractor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  kvk text,
  vat_number text,
  iban text,
  address_json jsonb,
  default_hourly_rate integer NOT NULL DEFAULT 5000,
  invoice_prefix text,
  timezone text NOT NULL DEFAULT 'Europe/Amsterdam',
  notification_preferences jsonb,
  team_owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contractor_profiles_user_id_key UNIQUE (user_id)
);

-- admin_settings: contractor-level settings
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_logo_url text,
  default_payment_terms text DEFAULT '30 dagen',
  default_vat_rate numeric DEFAULT 21,
  invoice_prefix text,
  invoice_template_settings jsonb,
  next_invoice_number integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_settings_contractor_id_key UNIQUE (contractor_id)
);

-- clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_i18n jsonb NOT NULL DEFAULT '{"nl": "", "en": "", "tr": ""}',
  contact_name text,
  contact_email text,
  billing_email text,
  address_json jsonb,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- invoice_templates
CREATE TABLE public.invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  line_items jsonb NOT NULL DEFAULT '[]',
  vat_rate numeric DEFAULT 21,
  payment_terms text DEFAULT '30 dagen',
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name_i18n jsonb NOT NULL DEFAULT '{"nl": "", "en": "", "tr": ""}',
  description_i18n jsonb,
  code text,
  po_number text,
  hourly_rate integer,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- time_entries
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time,
  end_time time,
  hours numeric NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'DRAFT',
  attachments jsonb,
  submitted_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- recurring_invoices
CREATE TABLE public.recurring_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.invoice_templates(id) ON DELETE SET NULL,
  frequency text NOT NULL DEFAULT 'MONTHLY',
  start_date date NOT NULL,
  end_date date,
  next_invoice_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_generated_at timestamptz,
  payment_terms text,
  vat_rate numeric DEFAULT 21,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  recurring_invoice_id uuid REFERENCES public.recurring_invoices(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  subtotal_cents integer NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 21,
  vat_amount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  notes text,
  payment_terms text,
  payment_method text,
  payment_link text,
  payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  pdf_url text,
  ubl_url text,
  sent_at timestamptz,
  viewed_at timestamptz,
  paid_at timestamptz,
  reminder_sent_at timestamptz,
  last_reminder_at timestamptz,
  client_approved_at timestamptz,
  client_approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number)
);

-- invoice_line_items
CREATE TABLE public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  time_entry_id uuid REFERENCES public.time_entries(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric NOT NULL,
  unit_price_cents integer NOT NULL,
  total_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- expenses
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  category text NOT NULL,
  description text,
  receipt_url text,
  vat_deductible boolean NOT NULL DEFAULT false,
  vat_amount_cents integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- team_invitations
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'CONTRACTOR',
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- client_access_tokens
CREATE TABLE public.client_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- backup_exports
CREATE TABLE public.backup_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  file_url text,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  action_url text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- project_view_prefs
CREATE TABLE public.project_view_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  locale public.locale NOT NULL DEFAULT 'nl',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_view_prefs_user_project_key UNIQUE (user_id, project_id)
);


-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_clients_contractor ON public.clients(contractor_id);
CREATE INDEX idx_projects_contractor ON public.projects(contractor_id);
CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_time_entries_contractor ON public.time_entries(contractor_id);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_invoices_contractor ON public.invoices(contractor_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_expenses_contractor ON public.expenses(contractor_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_recurring_invoices_next ON public.recurring_invoices(next_invoice_date);


-- 4. FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_invoice_number(contractor_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix text;
  next_num integer;
  result text;
BEGIN
  SELECT
    COALESCE(a.invoice_prefix, 'INV'),
    COALESCE(a.next_invoice_number, 1)
  INTO prefix, next_num
  FROM public.admin_settings a
  WHERE a.contractor_id = contractor_uuid;

  IF NOT FOUND THEN
    INSERT INTO public.admin_settings (contractor_id, invoice_prefix, next_invoice_number)
    VALUES (contractor_uuid, 'INV', 2)
    RETURNING invoice_prefix, next_invoice_number - 1
    INTO prefix, next_num;
  ELSE
    UPDATE public.admin_settings
    SET next_invoice_number = next_num + 1, updated_at = now()
    WHERE contractor_id = contractor_uuid;
  END IF;

  result := prefix || '-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(next_num::text, 4, '0');
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;


-- 5. TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contractor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoice_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_view_prefs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile + role + contractor_profile + admin_settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, preferred_locale, ui_theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'preferredLocale')::public.locale, 'nl'),
    COALESCE((NEW.raw_user_meta_data->>'uiTheme')::public.ui_theme, 'SYSTEM')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'CONTRACTOR');

  INSERT INTO public.contractor_profiles (
    user_id, company_name, kvk, vat_number, iban, default_hourly_rate
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'companyName', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'kvk',
    NEW.raw_user_meta_data->>'vatNumber',
    NEW.raw_user_meta_data->>'iban',
    COALESCE((NEW.raw_user_meta_data->>'defaultHourlyRate')::integer, 5000)
  );

  INSERT INTO public.admin_settings (contractor_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_view_prefs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- contractor_profiles
CREATE POLICY "Users can view own contractor profile"
  ON public.contractor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own contractor profile"
  ON public.contractor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contractor profile"
  ON public.contractor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- admin_settings
CREATE POLICY "Users can view own settings"
  ON public.admin_settings FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can update own settings"
  ON public.admin_settings FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can insert own settings"
  ON public.admin_settings FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

-- clients
CREATE POLICY "Users can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = contractor_id);

-- projects
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = contractor_id);

-- time_entries
CREATE POLICY "Users can view own time entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own time entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own time entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = contractor_id);

-- invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = contractor_id);

-- invoice_line_items (access via invoice ownership)
CREATE POLICY "Users can view own invoice line items"
  ON public.invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice line items"
  ON public.invoice_line_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice line items"
  ON public.invoice_line_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice line items"
  ON public.invoice_line_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

-- invoice_templates
CREATE POLICY "Users can view own templates"
  ON public.invoice_templates FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create templates"
  ON public.invoice_templates FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own templates"
  ON public.invoice_templates FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own templates"
  ON public.invoice_templates FOR DELETE
  USING (auth.uid() = contractor_id);

-- recurring_invoices
CREATE POLICY "Users can view own recurring invoices"
  ON public.recurring_invoices FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create recurring invoices"
  ON public.recurring_invoices FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own recurring invoices"
  ON public.recurring_invoices FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own recurring invoices"
  ON public.recurring_invoices FOR DELETE
  USING (auth.uid() = contractor_id);

-- expenses
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = contractor_id);

-- team_invitations
CREATE POLICY "Users can view own team invitations"
  ON public.team_invitations FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create team invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Users can delete own team invitations"
  ON public.team_invitations FOR DELETE
  USING (auth.uid() = contractor_id);

-- client_access_tokens (access via client ownership)
CREATE POLICY "Users can view own client access tokens"
  ON public.client_access_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Users can create client access tokens"
  ON public.client_access_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own client access tokens"
  ON public.client_access_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

-- audit_logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- backup_exports
CREATE POLICY "Users can view own exports"
  ON public.backup_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports"
  ON public.backup_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- project_view_prefs
CREATE POLICY "Users can view own prefs"
  ON public.project_view_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own prefs"
  ON public.project_view_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prefs"
  ON public.project_view_prefs FOR UPDATE
  USING (auth.uid() = user_id);
