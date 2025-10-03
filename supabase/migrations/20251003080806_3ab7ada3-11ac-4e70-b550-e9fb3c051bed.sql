-- Add server-side admin authorization checks

-- 1. Fix time_entries RLS to prevent self-approval
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Contractors can manage their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Contractors can view their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Contractors can create their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Contractors can update drafts, admins can approve" ON public.time_entries;
DROP POLICY IF EXISTS "Contractors can delete draft time entries" ON public.time_entries;

-- Recreate policies with proper admin checks
CREATE POLICY "Contractors can view their time entries"
ON public.time_entries
FOR SELECT
TO authenticated
USING (
  contractor_id = auth.uid()
  OR
  public.has_role(auth.uid(), 'ADMIN')
);

CREATE POLICY "Contractors can create their time entries"
ON public.time_entries
FOR INSERT
TO authenticated
WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update drafts, admins can approve"
ON public.time_entries
FOR UPDATE
TO authenticated
USING (
  -- Contractors can only edit their own drafts
  (contractor_id = auth.uid() AND status = 'DRAFT')
  OR
  -- Admins can update any time entry (for approvals)
  public.has_role(auth.uid(), 'ADMIN')
)
WITH CHECK (
  -- Prevent contractors from self-approving or self-rejecting
  (contractor_id = auth.uid() AND status IN ('DRAFT', 'SUBMITTED'))
  OR
  -- Admins can set any status
  public.has_role(auth.uid(), 'ADMIN')
);

CREATE POLICY "Contractors can delete draft time entries"
ON public.time_entries
FOR DELETE
TO authenticated
USING (
  contractor_id = auth.uid() AND status = 'DRAFT'
);

-- 2. Fix invoices RLS
-- Drop ALL existing invoice policies
DROP POLICY IF EXISTS "Contractors can manage their invoices" ON public.invoices;
DROP POLICY IF EXISTS "Contractors can view their invoices" ON public.invoices;
DROP POLICY IF EXISTS "Contractors can create their invoices" ON public.invoices;
DROP POLICY IF EXISTS "Contractors can update their invoices" ON public.invoices;
DROP POLICY IF EXISTS "Contractors can delete draft invoices" ON public.invoices;

-- Recreate with proper checks
CREATE POLICY "Contractors can view their invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  contractor_id = auth.uid()
  OR
  public.has_role(auth.uid(), 'ADMIN')
);

CREATE POLICY "Contractors can create their invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update their invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (
  contractor_id = auth.uid()
  OR
  public.has_role(auth.uid(), 'ADMIN')
)
WITH CHECK (
  -- Contractors can update own invoices but can't mark as viewed/paid
  (contractor_id = auth.uid() AND viewed_at IS NULL AND paid_at IS NULL)
  OR
  -- Admins can update anything
  public.has_role(auth.uid(), 'ADMIN')
);

CREATE POLICY "Contractors can delete draft invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (
  contractor_id = auth.uid() AND status = 'DRAFT'
);