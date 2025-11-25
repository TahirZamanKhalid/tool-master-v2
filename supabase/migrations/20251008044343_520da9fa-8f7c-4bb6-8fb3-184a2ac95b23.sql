-- Allow anyone (authenticated or anonymous) to insert ratings
CREATE POLICY "Anyone can insert ratings"
ON public.tool_ratings
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to view aggregate rating stats (this is handled by the function, but we need select access)
CREATE POLICY "Anyone can view ratings for stats"
ON public.tool_ratings
FOR SELECT
TO public
USING (true);