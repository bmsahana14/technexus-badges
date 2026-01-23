-- =====================================================
-- FINAL SUPABASE SETUP & POLICIES (IDEMPOTENT / RE-RUNNABLE)
-- =====================================================
-- This script is designed to be run multiple times safely.
-- It will not create duplicates or cause errors if run again.
-- =====================================================

-- 1. ADD UNIQUE CREDENTIAL COLUMN
ALTER TABLE public.badges 
ADD COLUMN IF NOT EXISTS credential_id VARCHAR(255) UNIQUE;

-- 2. ENABLE PUBLIC VIEWING FOR VERIFICATION (LinkedIn Sharing)
DROP POLICY IF EXISTS "Public can view individual badges for verification" ON public.badges;
CREATE POLICY "Public can view individual badges for verification"
    ON public.badges
    FOR SELECT
    USING (true);

-- 3. ENABLE PUBLIC READ FOR PROFILES
DROP POLICY IF EXISTS "Public can view profile names" ON public.profiles;
CREATE POLICY "Public can view profile names"
    ON public.profiles
    FOR SELECT
    USING (true);

-- 4. STORAGE BUCKET PERMISSIONS
DROP POLICY IF EXISTS "Public can view badge images" ON storage.objects;
CREATE POLICY "Public can view badge images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'badge-images');

DROP POLICY IF EXISTS "System can upload badge images" ON storage.objects;
CREATE POLICY "System can upload badge images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'badge-images');

-- 5. FUNCTION TO HANDLE NEW USER SIGNUPS
-- This function extracts name and designation from signup metadata 
-- and automatically creates a profile and claims any pending badges.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, designation, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'designation',
        NEW.email
    );

    UPDATE public.badges
    SET user_id = NEW.id,
        recipient_email = NULL
    WHERE recipient_email = NEW.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER TO RUN THE FUNCTION ON SIGNUP
-- This ensures the function runs EVERY TIME a new user sits up.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
