-- Create subtitle generation rate limits table
CREATE TABLE IF NOT EXISTS public.subtitle_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  generations_count INTEGER DEFAULT 0,
  last_generation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_or_session_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.subtitle_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own limits
CREATE POLICY "Users can view own limits"
ON public.subtitle_rate_limits
FOR SELECT
USING (
  auth.uid() = user_id OR 
  session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

-- Allow users to update their own limits
CREATE POLICY "Users can update own limits"
ON public.subtitle_rate_limits
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

-- Allow inserting new limits
CREATE POLICY "Users can insert own limits"
ON public.subtitle_rate_limits
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  session_id IS NOT NULL
);

-- Cleanup function for old rate limits
CREATE OR REPLACE FUNCTION public.cleanup_old_subtitle_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.subtitle_rate_limits
  WHERE last_generation < NOW() - INTERVAL '24 hours';
END;
$$;