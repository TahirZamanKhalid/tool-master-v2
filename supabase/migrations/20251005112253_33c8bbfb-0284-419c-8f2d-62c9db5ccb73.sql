-- Add explicit restrictive policies to caption_cache table for defense-in-depth
-- This prevents authenticated users from modifying cache entries
-- Only service role (edge functions) should write to this table

CREATE POLICY "Service only can insert cache"
ON caption_cache FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Service only can update cache"
ON caption_cache FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Service only can delete cache"
ON caption_cache FOR DELETE
TO authenticated
USING (false);