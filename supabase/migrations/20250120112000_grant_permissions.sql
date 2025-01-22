GRANT EXECUTE ON FUNCTION public.get_user_info_by_id TO anon, authenticated;
GRANT SELECT ON TABLE auth.users TO anon, authenticated;
GRANT SELECT ON TABLE public.user_roles TO anon, authenticated;