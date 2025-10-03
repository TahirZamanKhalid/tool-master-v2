-- Fix search analytics privacy issue
DROP POLICY IF EXISTS "Anyone can view search analytics" ON public.search_analytics;

-- Only allow users to see their own searches or anonymous searches
CREATE POLICY "Users can view their own search history"
  ON public.search_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Optional: Create function for public aggregate search stats (without exposing individual queries)
CREATE OR REPLACE FUNCTION public.get_popular_searches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  search_query TEXT,
  search_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    search_query,
    COUNT(*)::bigint as search_count
  FROM public.search_analytics
  GROUP BY search_query
  ORDER BY search_count DESC
  LIMIT limit_count;
$$;