CREATE OR REPLACE FUNCTION public.get_user_info_by_id(p_user_id UUID)
RETURNS TABLE(user_id UUID, email TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text, r.role
  FROM auth.users u
  LEFT JOIN user_roles r ON u.id = r.user_id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;