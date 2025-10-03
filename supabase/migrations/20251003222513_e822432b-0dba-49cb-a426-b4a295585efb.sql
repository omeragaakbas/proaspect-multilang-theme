-- Add INSERT policy for audit_logs to allow authenticated users to create their own logs
CREATE POLICY "Users can create their own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());