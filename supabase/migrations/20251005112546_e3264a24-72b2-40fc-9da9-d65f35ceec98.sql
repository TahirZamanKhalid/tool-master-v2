-- Update RLS policies to allow anonymous tracking
-- This enables tracking for unauthenticated users while maintaining user_id when available

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can track tool views" ON tool_views;
DROP POLICY IF EXISTS "Authenticated users can track searches" ON search_analytics;

-- Create new policies that allow anyone to insert
CREATE POLICY "Anyone can track tool views"
ON tool_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can track searches"
ON search_analytics FOR INSERT
WITH CHECK (true);