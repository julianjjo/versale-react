/*
  # Add anonymous access to view items
  
  1. Changes
    - Update items policies to allow anonymous access for viewing published items
  
  2. Security
    - Add policy for anonymous users to view published items
*/

-- Allow anonymous users to view published items
CREATE POLICY "Anonymous users can view published items"
  ON items
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Update existing policy to handle authenticated users
DROP POLICY IF EXISTS "Users can view published items or their own items" ON items;
CREATE POLICY "Users can view published items or their own items"
  ON items
  FOR SELECT
  TO authenticated
  USING (
    is_published = true OR
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND role = 'admin'
    )
  );