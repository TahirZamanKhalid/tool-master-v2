-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Authenticated users can insert their own ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.tool_ratings;

DROP POLICY IF EXISTS "Anyone can view tool analytics" ON public.tool_views;
DROP POLICY IF EXISTS "Anyone can insert tool views" ON public.tool_views;

DROP POLICY IF EXISTS "Anyone can view search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Anyone can insert search queries" ON public.search_analytics;

-- New secure policies for tool_ratings
-- Only show aggregate data publicly, not individual user ratings/comments
CREATE POLICY "Users can view their own ratings"
  ON public.tool_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own ratings"
  ON public.tool_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.tool_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.tool_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- For analytics: Only authenticated users can insert to prevent spam
-- But keep view access public for displaying stats
CREATE POLICY "Anyone can view tool analytics"
  ON public.tool_views FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can track tool views"
  ON public.tool_views FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view search analytics"
  ON public.search_analytics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can track searches"
  ON public.search_analytics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create a function to get average ratings without exposing individual data
CREATE OR REPLACE FUNCTION public.get_tool_rating_stats(tool_path_param TEXT)
RETURNS TABLE (
  avg_rating NUMERIC,
  total_ratings BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(rating)::numeric, 2) as avg_rating,
    COUNT(*)::bigint as total_ratings
  FROM public.tool_ratings
  WHERE tool_path = tool_path_param;
$$;