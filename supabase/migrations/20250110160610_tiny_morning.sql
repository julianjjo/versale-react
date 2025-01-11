/*
  # Add Favorites Table and Policies

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `item_id` (uuid, references items)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on favorites table
    - Add policies for authenticated users to:
      - View their own favorites
      - Add/remove favorites
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  item_id uuid NOT NULL REFERENCES items(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to add favorites
CREATE POLICY "Users can add favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to remove their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);