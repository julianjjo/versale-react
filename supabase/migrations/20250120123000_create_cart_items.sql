create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,      -- o uuid si tu user_id es un uuid
  item_id uuid references items(id),  -- asumiendo que "items" es tu tabla de productos
  quantity int not null default 1,
  inserted_at timestamp default now()
);

-- Asegúrate de no tener RLS que bloquee la inserción/lectura,
-- o define policies que permitan a tu "anon" / "authenticated" rol hacer select/insert/update.