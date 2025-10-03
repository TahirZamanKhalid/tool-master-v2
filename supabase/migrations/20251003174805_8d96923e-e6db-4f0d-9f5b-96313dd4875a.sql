-- Fix anonymous data exposure in search_analytics and tool_views
-- Remove the OR (user_id IS NULL) condition that exposes anonymous data

-- Fix search_analytics policy
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_analytics;

CREATE POLICY "Users can view their own search history"
  ON public.search_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Fix tool_views policy  
DROP POLICY IF EXISTS "Users can view their own tool history" ON public.tool_views;

CREATE POLICY "Users can view their own tool history"
  ON public.tool_views FOR SELECT
  USING (auth.uid() = user_id);