-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read categories
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can modify categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Update items table to reference categories
ALTER TABLE items 
DROP CONSTRAINT IF EXISTS items_category_fkey;

ALTER TABLE items
ALTER COLUMN category TYPE uuid USING gen_random_uuid(),
ADD CONSTRAINT items_category_fkey FOREIGN KEY (category) REFERENCES categories(id);

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
  ('Superiores', 'Camisas, blusas, camisetas y tops'),
  ('Inferiores', 'Pantalones, faldas y shorts'),
  ('Vestidos', 'Vestidos y conjuntos completos'),
  ('Prendas de Abrigo', 'Chaquetas, abrigos y suéteres'),
  ('Accesorios', 'Bolsos, cinturones y otros accesorios'),
  ('Zapatos', 'Todo tipo de calzado');