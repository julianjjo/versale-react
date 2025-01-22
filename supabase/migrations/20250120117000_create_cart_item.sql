create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  item_id uuid not null references items (id),
  quantity integer not null default 1,
  created_at timestamp default now()
);