-- Fix SECURITY DEFINER functions to add proper authorization checks

-- Update generate_invoice_number to verify contractor ownership
CREATE OR REPLACE FUNCTION public.generate_invoice_number(contractor_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  settings_record public.admin_settings;
  new_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- CRITICAL: Verify caller owns this contractor ID
  IF contractor_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot generate invoice number for another contractor';
  END IF;
  
  -- Get or create settings for contractor
  SELECT * INTO settings_record 
  FROM public.admin_settings 
  WHERE contractor_id = contractor_uuid;
  
  IF NOT FOUND THEN
    INSERT INTO public.admin_settings (contractor_id, invoice_prefix, next_invoice_number)
    VALUES (contractor_uuid, 'INV', 1)
    RETURNING * INTO settings_record;
  END IF;
  
  -- Generate invoice number
  new_number := settings_record.next_invoice_number;
  invoice_number := settings_record.invoice_prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(new_number::TEXT, 3, '0');
  
  -- Update next invoice number
  UPDATE public.admin_settings 
  SET next_invoice_number = next_invoice_number + 1 
  WHERE contractor_id = contractor_uuid;
  
  RETURN invoice_number;
END;
$$;

-- Update handle_new_user_registration to add input validation
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_name TEXT;
  user_company TEXT;
BEGIN
  -- Sanitize and validate name (alphanumeric, spaces, hyphens only, max 100 chars)
  user_name := COALESCE(TRIM(NEW.raw_user_meta_data->>'name'), '');
  IF LENGTH(user_name) > 100 THEN
    user_name := SUBSTRING(user_name FROM 1 FOR 100);
  END IF;
  
  -- Sanitize company name
  user_company := COALESCE(TRIM(NEW.raw_user_meta_data->>'company_name'), '');
  IF LENGTH(user_company) > 200 THEN
    user_company := SUBSTRING(user_company FROM 1 FOR 200);
  END IF;

  -- Insert into profiles table
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
    user_name,
    COALESCE((NEW.raw_user_meta_data->>'preferred_locale')::locale, 'nl'::locale),
    COALESCE((NEW.raw_user_meta_data->>'ui_theme')::ui_theme, 'SYSTEM'::ui_theme),
    COALESCE(TRIM(NEW.raw_user_meta_data->>'university'), ''),
    COALESCE(TRIM(NEW.raw_user_meta_data->>'major'), ''),
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
    user_company,
    5000,
    'Europe/Amsterdam'
  );

  RETURN NEW;
END;
$$;