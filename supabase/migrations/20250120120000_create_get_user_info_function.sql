create or replace function get_user_info()
returns table (
  user_id uuid,
  email text,
  role text
)
language sql
as $$
  select
    u.id as user_id,
    u.email as email,
    r.role
  from auth.users u
  left join user_roles r
    on u.id = r.user_id;
$$;