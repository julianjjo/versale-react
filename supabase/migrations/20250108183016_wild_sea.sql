/*
  # Create items and storage tables

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `size` (text)
      - `condition` (text)
      - `category` (text)
      - `images` (text array)
      - `seller_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `items` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  size text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Fair')),
  category text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  seller_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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