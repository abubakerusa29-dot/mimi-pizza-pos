CREATE OR REPLACE FUNCTION public.reset_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  DELETE FROM public.pos_invoices WHERE id IS NOT NULL;
  DELETE FROM public.reviews WHERE id IS NOT NULL;
  UPDATE public.pos_settings SET
    riders = '[]'::jsonb,
    restaurant = jsonb_set(restaurant, '{backOffice}', jsonb_build_object(
      'customers', '[]'::jsonb,
      'expenses', '[]'::jsonb,
      'team', COALESCE(restaurant->'backOffice'->'team', '[]'::jsonb),
      'stock', COALESCE((SELECT jsonb_agg(s || '{"qty":0}'::jsonb) FROM jsonb_array_elements(restaurant->'backOffice'->'stock') s), '[]'::jsonb)
    ), true),
    updated_at = now()
  WHERE id = 1;
END;
$$;
REVOKE ALL ON FUNCTION public.reset_all_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reset_all_data() TO authenticated;