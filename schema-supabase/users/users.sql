CREATE POLICY "Public update users"
ON public.users
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Public insert users"
ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Public delete users"
ON public.users
FOR DELETE
TO service_role
USING (true);

CREATE POLICY "Users read own records"
ON public.users
FOR SELECT
TO authenticated
USING (true);