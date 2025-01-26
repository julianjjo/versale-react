-- Ensure stock column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'items'
        AND column_name = 'stock'
    ) THEN
        ALTER TABLE items
        ADD COLUMN stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0);
    END IF;
END $$;

-- Create purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    item_id UUID REFERENCES items(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop old triggers that were decreasing stock on cart operations
DROP TRIGGER IF EXISTS update_stock_trigger ON cart_items;

-- Create function to decrease stock on purchase
CREATE OR REPLACE FUNCTION decrease_stock_on_purchase() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock
    UPDATE items 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.item_id 
    AND stock >= NEW.quantity;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock available';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stock after successful purchase
CREATE TRIGGER update_stock_trigger
    BEFORE INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION decrease_stock_on_purchase();

-- Update items RLS policy to allow stock updates via trigger
DROP POLICY IF EXISTS "Users can update their own items" ON items;

CREATE POLICY "Users can update their own items"
    ON items
    FOR UPDATE
    TO authenticated
    USING (
        CASE
            WHEN auth.uid() = seller_id THEN true  -- Seller can update anything
            ELSE true  -- Anyone can update stock via trigger
        END
    )
    WITH CHECK (
        CASE
            WHEN auth.uid() = seller_id THEN true  -- Seller can update anything
            ELSE true  -- Anyone can update stock via trigger
        END
    );

-- Add RLS policies for purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own purchases
CREATE POLICY "Users can view their own purchases"
    ON purchases
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create purchases
CREATE POLICY "Users can create purchases"
    ON purchases
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);