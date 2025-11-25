-- Fix 1: Secure tool_ratings table policies
-- Drop the dangerous "anyone can do anything" policies
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings for stats" ON public.tool_ratings;

-- Keep public read access for displaying aggregate ratings
CREATE POLICY "Public can view ratings for display"
ON public.tool_ratings
FOR SELECT
USING (true);

-- Restrict INSERT to prevent spam - only authenticated users or with session validation
CREATE POLICY "Authenticated users can insert own ratings"
ON public.tool_ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous ratings but restrict updates to authenticated users only
CREATE POLICY "Anonymous can insert ratings"
ON public.tool_ratings
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Only allow users to update their OWN ratings (fixes the critical vulnerability)
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.tool_ratings;
CREATE POLICY "Users can update only their own ratings"
ON public.tool_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix 2: Support anonymous analytics tracking
-- Make user_id nullable and add session tracking
ALTER TABLE public.tool_views 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.tool_views 
  ADD COLUMN IF NOT EXISTS session_id TEXT;

ALTER TABLE public.search_analytics 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.search_analytics 
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add missing INSERT policies for analytics
CREATE POLICY "Anyone can track tool views"
ON public.tool_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can track searches"
ON public.search_analytics
FOR INSERT
WITH CHECK (true);

-- Update SELECT policies to work with nullable user_id
DROP POLICY IF EXISTS "Users can view their own tool history" ON public.tool_views;
CREATE POLICY "Users can view their own tool history"
ON public.tool_views
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_analytics;
CREATE POLICY "Users can view their own search history"
ON public.search_analytics
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);