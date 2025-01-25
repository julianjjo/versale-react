-- Drop existing table with cascade to remove dependencies
DROP TABLE IF EXISTS items CASCADE;

-- Create a new temporary name for the table
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  size text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Nuevo', 'Como Nuevo', 'Bueno', 'Regular')),
  category text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  seller_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Allow users to read all items
CREATE POLICY "Anyone can view items"
  ON items
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow users to create their own items
CREATE POLICY "Users can create their own items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Allow users to update their own items
CREATE POLICY "Users can update their own items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Allow users to delete their own items
CREATE POLICY "Users can delete their own items"
  ON items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);