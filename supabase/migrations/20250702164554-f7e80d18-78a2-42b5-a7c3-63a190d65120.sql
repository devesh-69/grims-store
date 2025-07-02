-- Create admin role for existing user and fix user creation trigger
-- Add admin role to the first user (assuming it's the main admin)
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- If there is a user, give them admin role
    IF first_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) 
        VALUES (first_user_id, 'admin'::user_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- Create trigger to automatically create profile when user is created via admin function
CREATE OR REPLACE FUNCTION public.handle_admin_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into profiles table when a new auth user is created
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', profiles.first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', profiles.last_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user_creation();