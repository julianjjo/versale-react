-- Add stock column to items table
ALTER TABLE items 
ADD COLUMN stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- Add function to check stock before purchase
CREATE OR REPLACE FUNCTION check_stock_available() 
RETURNS TRIGGER AS $$
BEGIN
    -- Check if we have enough stock
    IF (SELECT stock FROM items WHERE id = NEW.item_id) < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock available';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add function to update stock on successful purchase
CREATE OR REPLACE FUNCTION decrease_stock_on_purchase() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock
    UPDATE items 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check stock before cart item insertion
DROP TRIGGER IF EXISTS check_stock_trigger ON cart_items;
CREATE TRIGGER check_stock_trigger
    BEFORE INSERT OR UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_available();

-- Create trigger to update stock after successful purchase
DROP TRIGGER IF EXISTS update_stock_trigger ON cart_items;
CREATE TRIGGER update_stock_trigger
    AFTER INSERT OR UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION decrease_stock_on_purchase();
