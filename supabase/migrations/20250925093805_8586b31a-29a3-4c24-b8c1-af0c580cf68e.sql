-- Create enums for user roles, themes, and locales
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'CONTRACTOR');
CREATE TYPE public.ui_theme AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
CREATE TYPE public.locale AS ENUM ('nl', 'en', 'tr');

-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'CONTRACTOR',
ADD COLUMN IF NOT EXISTS preferred_locale public.locale DEFAULT 'nl',
ADD COLUMN IF NOT EXISTS ui_theme public.ui_theme DEFAULT 'SYSTEM';

-- Create contractor_profiles table
CREATE TABLE IF NOT EXISTS public.contractor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  kvk TEXT,
  vat_number TEXT,
  iban TEXT,
  address_json JSONB,
  default_hourly_rate INTEGER NOT NULL DEFAULT 5000, -- in cents, default €50/hour
  invoice_prefix TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contractor_profiles
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contractor_profiles  
CREATE POLICY "Contractors can view their own profile" 
ON public.contractor_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Contractors can update their own profile" 
ON public.contractor_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Contractors can insert their own profile" 
ON public.contractor_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration (update existing one)
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update existing profiles table with new columns
  UPDATE public.profiles 
  SET 
    role = COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'CONTRACTOR'::public.app_role),
    preferred_locale = COALESCE((NEW.raw_user_meta_data->>'preferredLocale')::public.locale, 'nl'::public.locale),
    ui_theme = COALESCE((NEW.raw_user_meta_data->>'uiTheme')::public.ui_theme, 'SYSTEM'::public.ui_theme)
  WHERE user_id = NEW.id;
  
  -- If role is CONTRACTOR, also create contractor profile
  IF COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'CONTRACTOR'::public.app_role) = 'CONTRACTOR' THEN
    INSERT INTO public.contractor_profiles (user_id, company_name, default_hourly_rate)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'companyName', 'My Company'),
      COALESCE((NEW.raw_user_meta_data->>'defaultHourlyRate')::INTEGER, 5000)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add update timestamp trigger for contractor_profiles
CREATE TRIGGER update_contractor_profiles_updated_at
  BEFORE UPDATE ON public.contractor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();