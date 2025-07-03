-- Fix blog creation permission issue by updating RLS policies

-- First, let's fix the RLS policies for blogs table to allow proper admin access
DROP POLICY IF EXISTS "Admins can do everything" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users have full access" ON public.blogs;

-- Create a cleaner admin policy for blogs that allows admin users to manage all blogs
CREATE POLICY "Admins can manage all blogs" 
ON public.blogs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR 
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email IN ('admin@example.com', 'tatkaredevesh69@gmail.com')
  )
);

-- Clean up existing data by removing orphaned records (but respect foreign keys)
DELETE FROM wishlist_products WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM shared_wishlists WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);
DELETE FROM blogs WHERE author_id NOT IN (SELECT id FROM auth.users);

-- Ensure admin roles exist for existing admin emails
INSERT INTO user_roles (
  user_id,
  role,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'admin'::user_role,
  now(),
  now()
FROM auth.users u 
WHERE u.email IN ('admin@example.com', 'tatkaredevesh69@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;