-- Allow anonymous ratings by making user_id a text field that can store anonymous IDs
-- This is a non-destructive migration that preserves existing data

-- Step 1: Add a new text column for user identifiers (can be UUID or anonymous ID)
ALTER TABLE tool_ratings ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- Step 2: Migrate existing user_id data to user_identifier
UPDATE tool_ratings 
SET user_identifier = user_id::text 
WHERE user_identifier IS NULL AND user_id IS NOT NULL;

-- Step 3: Make user_identifier NOT NULL with a default
ALTER TABLE tool_ratings ALTER COLUMN user_identifier SET NOT NULL;

-- Step 4: Drop the old unique constraint
ALTER TABLE tool_ratings DROP CONSTRAINT IF EXISTS tool_ratings_tool_path_user_id_key;

-- Step 5: Add new unique constraint on tool_path + user_identifier
ALTER TABLE tool_ratings ADD CONSTRAINT tool_ratings_tool_path_user_identifier_key 
  UNIQUE (tool_path, user_identifier);

-- Step 6: Update RLS policies to allow anonymous ratings
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Authenticated users can insert their own ratings" ON tool_ratings;
DROP POLICY IF EXISTS "Authenticated users can update their own ratings" ON tool_ratings;
DROP POLICY IF EXISTS "Anyone can insert ratings" ON tool_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON tool_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON tool_ratings;

-- Create new policies
CREATE POLICY "Anyone can insert ratings"
ON tool_ratings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update ratings"
ON tool_ratings FOR UPDATE
USING (true);

CREATE POLICY "Anyone can view ratings" 
ON tool_ratings FOR SELECT 
USING (true);