-- Clear out cart_items since the referenced items no longer exist
TRUNCATE cart_items;

-- Drop existing constraint if it exists
ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_item_id_fkey;

-- Add new foreign key constraint to the recreated items table
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_item_id_fkey 
FOREIGN KEY (item_id) 
REFERENCES items(id) 
ON DELETE CASCADE;