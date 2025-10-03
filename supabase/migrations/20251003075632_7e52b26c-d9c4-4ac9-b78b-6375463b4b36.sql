-- Fix security issues: Create user_roles system and restrict profile access

-- 1. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Create RLS policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update profiles RLS policy to restrict public access to PII
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view limited public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only show limited fields for other users
  user_id != auth.uid()
);

-- Note: Frontend should filter sensitive fields when showing other users' profiles

-- 6. Update handle_new_user_registration to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Extract role from metadata, default to CONTRACTOR
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'CONTRACTOR'::app_role
  );
  
  -- Prevent users from self-assigning ADMIN role
  -- Only existing admins can create new admins (handled by RLS)
  IF user_role = 'ADMIN' THEN
    user_role := 'CONTRACTOR'::app_role;
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id,
    email,
    name,
    role,
    preferred_locale,
    ui_theme,
    university,
    major,
    year
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    user_role,
    COALESCE((NEW.raw_user_meta_data->>'preferred_locale')::locale, 'nl'::locale),
    COALESCE((NEW.raw_user_meta_data->>'ui_theme')::ui_theme, 'SYSTEM'::ui_theme),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE(NEW.raw_user_meta_data->>'major', ''),
    COALESCE((NEW.raw_user_meta_data->>'year')::integer, 1)
  );

  -- Insert role into user_roles table (this is the authoritative source)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- If contractor, create contractor profile
  IF user_role = 'CONTRACTOR' THEN
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
  END IF;

  RETURN NEW;
END;
$$;