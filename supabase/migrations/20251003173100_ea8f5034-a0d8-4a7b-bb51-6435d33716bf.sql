-- Create table for tool ratings
CREATE TABLE public.tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tool_path, user_id)
);

-- Create table for tool views/usage analytics
CREATE TABLE public.tool_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_path TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for search analytics
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_ratings
CREATE POLICY "Anyone can view ratings"
  ON public.tool_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own ratings"
  ON public.tool_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.tool_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.tool_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tool_views (public read, anyone can insert)
CREATE POLICY "Anyone can view tool analytics"
  ON public.tool_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tool views"
  ON public.tool_views FOR INSERT
  WITH CHECK (true);

-- RLS Policies for search_analytics
CREATE POLICY "Anyone can view search analytics"
  ON public.search_analytics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert search queries"
  ON public.search_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tool_ratings_path ON public.tool_ratings(tool_path);
CREATE INDEX idx_tool_views_path ON public.tool_views(tool_path);
CREATE INDEX idx_tool_views_date ON public.tool_views(viewed_at);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);
CREATE INDEX idx_search_analytics_date ON public.search_analytics(searched_at);