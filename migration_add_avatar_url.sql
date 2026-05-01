-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- (Optional) If you want users to be able to upload avatars from the client side without using the service role API route, you can use the following bucket setup.
-- However, since the app uses the /api/upload route with the service role key, this is not strictly necessary. 
-- It uploads to the existing 'badge-images' bucket.
