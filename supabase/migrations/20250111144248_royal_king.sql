/*
  # Add administrator roles and publishing system

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text, either 'admin' or 'user')
      - `created_at` (timestamp)

  2. Changes
    - Add published status to items table
    - Update items policies for admin publishing system

  3. Security
    - Enable RLS on user_roles table
    - Add policies for admin role management
    - Update item visibility based on published status
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles
CREATE POLICY "Only admins can view roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Add published status to items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Update items policies for publishing
DROP POLICY IF EXISTS "Only admins can publish items" ON items;
CREATE POLICY "Admins can update any item, users can only update unpublished own items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin') OR
    (auth.uid() = seller_id AND NOT is_published)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin') OR
    (auth.uid() = seller_id AND NOT is_published)
  );

-- Only show published items to regular users
DROP POLICY IF EXISTS "Anyone can view items" ON items;
CREATE POLICY "Users can view published items or their own items"
  ON items
  FOR SELECT
  TO authenticated, anon
  USING (
    is_published = true OR
    auth.uid() = seller_id OR
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );