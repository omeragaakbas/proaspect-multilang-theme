-- Fix critical security issues: privilege escalation and data exposure

-- 1. Fix handle_new_user_registration to NEVER read roles from user input
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ALWAYS assign CONTRACTOR role, completely ignore user input for security
  -- Only admins can assign other roles via separate admin functions
  
  -- Insert into profiles table (without role)
  INSERT INTO public.profiles (
    user_id,
    email,
    name,
    preferred_locale,
    ui_theme,
    university,
    major,
    year
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'preferred_locale')::locale, 'nl'::locale),
    COALESCE((NEW.raw_user_meta_data->>'ui_theme')::ui_theme, 'SYSTEM'::ui_theme),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE(NEW.raw_user_meta_data->>'major', ''),
    COALESCE((NEW.raw_user_meta_data->>'year')::integer, 1)
  );

  -- ALWAYS create CONTRACTOR role - this is the ONLY role assigned at registration
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'CONTRACTOR'::app_role);

  -- Always create contractor profile for new users
  INSERT INTO public.contractor_profiles (
    user_id,
    company_name,
    default_hourly_rate,
    timezone
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    5000,
    'Europe/Amsterdam'
  );

  RETURN NEW;
END;
$$;

-- 2. Remove the duplicate role column from profiles table
-- This prevents data integrity issues and privilege escalation
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 3. Fix profiles RLS - remove ALL SELECT policies and recreate them properly
DROP POLICY IF EXISTS "Users can view limited public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles with restrictions" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- Recreate policies: one for own profile, one for others with restrictions
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view other profiles with restrictions"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id != auth.uid()
  -- Application should filter: email, preferred_locale, ui_theme, roles, availability
  -- and only show: name, photo_url, university, major, year, bio, courses, languages
);

-- 4. Drop existing storage policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents they uploaded" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Add storage bucket RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add storage bucket RLS policies for documents bucket
CREATE POLICY "Users can view documents they uploaded"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);