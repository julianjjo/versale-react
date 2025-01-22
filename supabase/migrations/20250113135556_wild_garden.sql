/*
  # Update item policies for admin publishing
  
  1. Changes
    - Restrict item publishing to admin users only
    - Allow normal users to only create unpublished items
    - Ensure users can only update their own unpublished items
  
  2. Security
    - Maintain existing view permissions
    - Add specific controls for publishing status
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Admins can update any item, users can only update unpublished own items" ON items;

-- Create new policies for item management
CREATE POLICY "Users can create unpublished items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_published AND
    auth.uid() = seller_id
  );

CREATE POLICY "Admins can update any item"
  ON items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own unpublished items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (
    NOT is_published AND
    auth.uid() = seller_id
  )
  WITH CHECK (
    NOT is_published AND
    auth.uid() = seller_id
  );