-- Create caption cache table
CREATE TABLE IF NOT EXISTS public.caption_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  style TEXT NOT NULL,
  captions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  hit_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.caption_cache ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read cached captions (public data)
CREATE POLICY "Anyone can read caption cache"
  ON public.caption_cache
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_caption_cache_key ON public.caption_cache(cache_key);
CREATE INDEX idx_caption_cache_created ON public.caption_cache(created_at DESC);

-- Function to clean old cache entries (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_caption_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete entries older than 30 days with low hit counts
  DELETE FROM public.caption_cache
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND hit_count < 5;
END;
$$;