-- Fix server-side authorization: prevent contractors from self-approving time entries

-- Drop the existing policy and create a more restrictive one
DROP POLICY IF EXISTS "Contractors can manage their time entries" ON public.time_entries;

-- Create separate policies for different operations

-- 1. Contractors can view their own time entries
CREATE POLICY "Contractors can view own time entries"
ON public.time_entries
FOR SELECT
TO authenticated
USING (contractor_id = auth.uid());

-- 2. Contractors can insert their own time entries
CREATE POLICY "Contractors can create own time entries"
ON public.time_entries
FOR INSERT
TO authenticated
WITH CHECK (contractor_id = auth.uid());

-- 3. Contractors can update their own DRAFT entries, Admins can update any
CREATE POLICY "Contractors can edit drafts, admins can approve"
ON public.time_entries
FOR UPDATE
TO authenticated
USING (
  -- Contractors can only edit their own drafts
  (contractor_id = auth.uid() AND status = 'DRAFT')
  OR
  -- Admins can update any time entry (for approvals/rejections)
  public.has_role(auth.uid(), 'ADMIN')
)
WITH CHECK (
  -- Prevent contractors from self-approving (changing status to APPROVED/REJECTED)
  CASE
    WHEN contractor_id = auth.uid() THEN
      status IN ('DRAFT', 'SUBMITTED')
    ELSE
      true  -- Admins can set any status
  END
);

-- 4. Contractors can delete their own DRAFT entries
CREATE POLICY "Contractors can delete own drafts"
ON public.time_entries
FOR DELETE
TO authenticated
USING (contractor_id = auth.uid() AND status = 'DRAFT');