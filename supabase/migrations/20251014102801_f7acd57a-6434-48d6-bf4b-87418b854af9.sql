-- Create rate limiting table for contact form
CREATE TABLE IF NOT EXISTS public.contact_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  last_submission TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- Service role only policies
CREATE POLICY "Service role can manage rate limits"
ON public.contact_rate_limit
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_identifier ON public.contact_rate_limit(identifier);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_last_submission ON public.contact_rate_limit(last_submission);

-- Function to cleanup old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.contact_rate_limit
  WHERE last_submission < NOW() - INTERVAL '1 hour';
END;
$$;

-- Delete existing NULL user_id records (anonymous data)
DELETE FROM public.tool_ratings WHERE user_id IS NULL;
DELETE FROM public.tool_views WHERE user_id IS NULL;
DELETE FROM public.search_analytics WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.tool_ratings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.tool_views ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.search_analytics ALTER COLUMN user_id SET NOT NULL;

-- Drop the conflicting anonymous policies  
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Anyone can track tool views" ON public.tool_views;
DROP POLICY IF EXISTS "Anyone can track searches" ON public.search_analytics;

-- Add unique constraint to prevent duplicate ratings per user per tool
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_tool_rating'
  ) THEN
    ALTER TABLE public.tool_ratings 
    ADD CONSTRAINT unique_user_tool_rating UNIQUE (user_id, tool_path);
  END IF;
END $$;