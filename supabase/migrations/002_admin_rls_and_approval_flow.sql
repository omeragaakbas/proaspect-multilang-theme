-- ============================================================
-- Migration 002: ADMIN RLS + Invoice Approval Flow
-- ADMIN kan alle data zien/bewerken, factuur goedkeuringsflow
-- ============================================================

-- 1. ADD INVOICE APPROVAL COLUMNS
-- ============================================================

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;


-- 2. DROP ALL EXISTING RLS POLICIES
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- contractor_profiles
DROP POLICY IF EXISTS "Users can view own contractor profile" ON public.contractor_profiles;
DROP POLICY IF EXISTS "Users can update own contractor profile" ON public.contractor_profiles;
DROP POLICY IF EXISTS "Users can insert own contractor profile" ON public.contractor_profiles;

-- admin_settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.admin_settings;

-- clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;

-- projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- time_entries
DROP POLICY IF EXISTS "Users can view own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON public.time_entries;

-- invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;

-- invoice_line_items
DROP POLICY IF EXISTS "Users can view own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update own invoice line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete own invoice line items" ON public.invoice_line_items;

-- invoice_templates
DROP POLICY IF EXISTS "Users can view own templates" ON public.invoice_templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.invoice_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.invoice_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.invoice_templates;

-- recurring_invoices
DROP POLICY IF EXISTS "Users can view own recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can create recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can update own recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can delete own recurring invoices" ON public.recurring_invoices;

-- expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- team_invitations
DROP POLICY IF EXISTS "Users can view own team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can delete own team invitations" ON public.team_invitations;

-- client_access_tokens
DROP POLICY IF EXISTS "Users can view own client access tokens" ON public.client_access_tokens;
DROP POLICY IF EXISTS "Users can create client access tokens" ON public.client_access_tokens;
DROP POLICY IF EXISTS "Users can delete own client access tokens" ON public.client_access_tokens;

-- audit_logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;

-- backup_exports
DROP POLICY IF EXISTS "Users can view own exports" ON public.backup_exports;
DROP POLICY IF EXISTS "Users can create exports" ON public.backup_exports;

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- project_view_prefs
DROP POLICY IF EXISTS "Users can view own prefs" ON public.project_view_prefs;
DROP POLICY IF EXISTS "Users can upsert own prefs" ON public.project_view_prefs;
DROP POLICY IF EXISTS "Users can update own prefs" ON public.project_view_prefs;


-- 3. RECREATE ALL POLICIES WITH ADMIN ACCESS
-- ============================================================

-- profiles
CREATE POLICY "Own or admin: select profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

-- user_roles
CREATE POLICY "Own or admin: select role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Admin: update role"
  ON public.user_roles FOR UPDATE
  USING (public.has_role('ADMIN', auth.uid()));

-- contractor_profiles
CREATE POLICY "Own or admin: select contractor profile"
  ON public.contractor_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update contractor profile"
  ON public.contractor_profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert contractor profile"
  ON public.contractor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- admin_settings
CREATE POLICY "Own or admin: select settings"
  ON public.admin_settings FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update settings"
  ON public.admin_settings FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert settings"
  ON public.admin_settings FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

-- clients
CREATE POLICY "Own or admin: select clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- projects
CREATE POLICY "Own or admin: select projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- time_entries
CREATE POLICY "Own or admin: select time entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Own or admin: update time entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete time entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- invoices
CREATE POLICY "Own or admin: select invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Own or admin: update invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- invoice_line_items (access via invoice ownership or admin)
CREATE POLICY "Own or admin: select invoice line items"
  ON public.invoice_line_items FOR SELECT
  USING (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Own or admin: insert invoice line items"
  ON public.invoice_line_items FOR INSERT
  WITH CHECK (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Own or admin: update invoice line items"
  ON public.invoice_line_items FOR UPDATE
  USING (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Own or admin: delete invoice line items"
  ON public.invoice_line_items FOR DELETE
  USING (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.contractor_id = auth.uid()
    )
  );

-- invoice_templates
CREATE POLICY "Own or admin: select templates"
  ON public.invoice_templates FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: insert templates"
  ON public.invoice_templates FOR INSERT
  WITH CHECK (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update templates"
  ON public.invoice_templates FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete templates"
  ON public.invoice_templates FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- recurring_invoices
CREATE POLICY "Own or admin: select recurring invoices"
  ON public.recurring_invoices FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: insert recurring invoices"
  ON public.recurring_invoices FOR INSERT
  WITH CHECK (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: update recurring invoices"
  ON public.recurring_invoices FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete recurring invoices"
  ON public.recurring_invoices FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- expenses
CREATE POLICY "Own or admin: select expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Own or admin: update expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- team_invitations
CREATE POLICY "Own or admin: select team invitations"
  ON public.team_invitations FOR SELECT
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: insert team invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own or admin: delete team invitations"
  ON public.team_invitations FOR DELETE
  USING (auth.uid() = contractor_id OR public.has_role('ADMIN', auth.uid()));

-- client_access_tokens (access via client ownership or admin)
CREATE POLICY "Own or admin: select client access tokens"
  ON public.client_access_tokens FOR SELECT
  USING (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Own or admin: insert client access tokens"
  ON public.client_access_tokens FOR INSERT
  WITH CHECK (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Own or admin: delete client access tokens"
  ON public.client_access_tokens FOR DELETE
  USING (
    public.has_role('ADMIN', auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_access_tokens.client_id
      AND clients.contractor_id = auth.uid()
    )
  );

-- audit_logs
CREATE POLICY "Own or admin: select audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Authenticated: insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- backup_exports
CREATE POLICY "Own or admin: select exports"
  ON public.backup_exports FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert exports"
  ON public.backup_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- notifications
CREATE POLICY "Own or admin: select notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: update notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated: insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- project_view_prefs
CREATE POLICY "Own or admin: select prefs"
  ON public.project_view_prefs FOR SELECT
  USING (auth.uid() = user_id OR public.has_role('ADMIN', auth.uid()));

CREATE POLICY "Own: insert prefs"
  ON public.project_view_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own: update prefs"
  ON public.project_view_prefs FOR UPDATE
  USING (auth.uid() = user_id);


-- 4. CREATE INDEX FOR APPROVAL FLOW
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_invoices_submitted ON public.invoices(status) WHERE status = 'SUBMITTED';
CREATE INDEX IF NOT EXISTS idx_invoices_approved_by ON public.invoices(approved_by);
