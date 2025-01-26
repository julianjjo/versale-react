-- Create function to safely decrement stock
create or replace function decrement(x integer)
returns integer
language sql
as $$
  select greatest(0, stock - x)
$$;

-- Update items table RLS policies to allow stock updates
create policy "Anyone can update item stock"
  on items
  for update using (
    true
  )
  with check (
    true
  );