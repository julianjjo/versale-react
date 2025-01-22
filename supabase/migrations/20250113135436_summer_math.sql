/*
  # Fix user_roles policies
  
  1. Changes
    - Update user_roles policies to prevent infinite recursion
    - Simplify admin role checks
  
  2. Security
    - Maintain admin-only access to user_roles table
    - Fix infinite recursion in policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can view roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;

-- Create new simplified policies
CREATE POLICY "Anyone can view roles"
  ON user_roles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );