-- Fix tool views privacy issue - user browsing history exposed
DROP POLICY IF EXISTS "Anyone can view tool analytics" ON public.tool_views;

-- Only allow users to see their own browsing history
CREATE POLICY "Users can view their own tool history"
  ON public.tool_views FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function for public aggregate tool stats (without exposing individual user data)
CREATE OR REPLACE FUNCTION public.get_tool_view_stats(tool_path_param TEXT DEFAULT NULL)
RETURNS TABLE (
  tool_path TEXT,
  view_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tool_views.tool_path,
    COUNT(*)::bigint as view_count
  FROM public.tool_views
  WHERE tool_path_param IS NULL OR tool_views.tool_path = tool_path_param
  GROUP BY tool_views.tool_path
  ORDER BY view_count DESC;
$$;