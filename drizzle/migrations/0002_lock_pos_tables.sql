DROP POLICY IF EXISTS "POS invoices are insertable by everyone" ON public.pos_invoices;
DROP POLICY IF EXISTS "POS invoices are readable by everyone" ON public.pos_invoices;
DROP POLICY IF EXISTS "POS invoices are updatable by everyone" ON public.pos_invoices;
DROP POLICY IF EXISTS "POS settings are insertable by everyone" ON public.pos_settings;
DROP POLICY IF EXISTS "POS settings are readable by everyone" ON public.pos_settings;
DROP POLICY IF EXISTS "POS settings are updatable by everyone" ON public.pos_settings;
REVOKE ALL ON public.pos_invoices FROM anon;
REVOKE ALL ON public.pos_settings FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.pos_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pos_settings TO authenticated;
CREATE POLICY "Signed-in staff read invoices" ON public.pos_invoices FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff add invoices" ON public.pos_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff update invoices" ON public.pos_invoices FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff read settings" ON public.pos_settings FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff add settings" ON public.pos_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff update settings" ON public.pos_settings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.track_order(_order_no integer)
RETURNS TABLE(order_no integer, order_type text, status text, created_at timestamptz, rider text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.order_no, i.order_type, i.status, i.created_at, i.rider FROM public.pos_invoices i
  WHERE i.order_no = _order_no AND i.order_type <> 'Dine-in' ORDER BY i.created_at DESC LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.public_menu_overrides()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT menu_overrides FROM public.pos_settings WHERE id = 1
$$;
REVOKE ALL ON FUNCTION public.track_order(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_menu_overrides() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_menu_overrides() TO anon, authenticated;