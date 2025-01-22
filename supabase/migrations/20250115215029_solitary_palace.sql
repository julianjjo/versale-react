/*
  # Fix user information access function
  
  1. Changes
    - Fix ambiguous column references by using table aliases
    - Improve query clarity with explicit column references
*/

-- Create a function to get user information securely
CREATE OR REPLACE FUNCTION get_user_info()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  ) THEN
    RETURN QUERY
    SELECT 
      au.id as user_id,
      au.email,
      COALESCE(ur.role, 'user') as role
    FROM auth.users au
    LEFT JOIN user_roles ur ON ur.user_id = au.id;
  ELSE
    -- Non-admin users can only see their own info
    RETURN QUERY
    SELECT 
      au.id as user_id,
      au.email,
      COALESCE(ur.role, 'user') as role
    FROM auth.users au
    LEFT JOIN user_roles ur ON ur.user_id = au.id
    WHERE au.id = auth.uid();
  END IF;
END;
$$;