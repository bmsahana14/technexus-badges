-- =====================================================
-- Badge Delivery Platform - Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_image_url TEXT,
    event_name VARCHAR(255) NOT NULL,
    issued_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_issued_date ON public.badges(issued_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users can only view their own badges
CREATE POLICY "Users can view own badges"
    ON public.badges
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert badges (for API routes)
CREATE POLICY "Service role can insert badges"
    ON public.badges
    FOR INSERT
    WITH CHECK (true);

-- Users can update their own badges (optional)
CREATE POLICY "Users can update own badges"
    ON public.badges
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own badges (optional)
CREATE POLICY "Users can delete own badges"
    ON public.badges
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.badges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Storage Bucket Setup
-- =====================================================
-- Run these commands in Supabase Dashboard > Storage
-- =====================================================

-- Create a private storage bucket for badge images
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named 'badge-images'
-- 3. Set it to Private
-- 4. Add the following RLS policies:

-- Policy: Users can view their own badge images
-- CREATE POLICY "Users can view own badge images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'badge-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Service role can upload badge images
-- CREATE POLICY "Service role can upload badge images"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'badge-images');

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Insert sample badge (replace user_id with actual user ID)
-- INSERT INTO public.badges (user_id, badge_name, badge_description, event_name, issued_date)
-- VALUES (
--     'YOUR_USER_ID_HERE',
--     'Web Development Master',
--     'Completed advanced web development course',
--     'Web Dev Bootcamp 2026',
--     NOW()
-- );
