-- Make user_id nullable to allow anonymous ratings
ALTER TABLE public.tool_ratings ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint since anonymous users won't have a user_id in auth.users
ALTER TABLE public.tool_ratings DROP CONSTRAINT IF EXISTS tool_ratings_user_id_fkey;

-- Add a new foreign key constraint that allows NULL values
ALTER TABLE public.tool_ratings 
ADD CONSTRAINT tool_ratings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;