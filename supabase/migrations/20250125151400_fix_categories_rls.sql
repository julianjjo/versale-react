-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Admins can modify categories" ON categories;

-- Create a new policy that allows admins to perform all operations
CREATE POLICY "Admins can modify categories"
ON categories
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);