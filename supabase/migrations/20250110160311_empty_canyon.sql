/*
  # Add Storage Policies for Image Upload

  1. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to:
      - Upload images
      - Read images
      - Delete their own images
*/

-- Enable RLS for the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images_clothes', 'images_clothes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'images_clothes'
);

-- Allow anyone to view images
CREATE POLICY "Allow public to view images"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'images_clothes'
);

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'images_clothes' AND
  auth.uid() = owner
);