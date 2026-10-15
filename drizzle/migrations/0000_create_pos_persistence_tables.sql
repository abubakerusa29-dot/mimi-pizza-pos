CREATE TABLE public.pos_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no integer NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_type text NOT NULL DEFAULT 'Dine-in',
  table_no text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  rider text,
  area text,
  status text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_invoices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_invoices TO authenticated;
GRANT ALL ON public.pos_invoices TO service_role;
ALTER TABLE public.pos_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "POS invoices are readable by everyone" ON public.pos_invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "POS invoices are insertable by everyone" ON public.pos_invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "POS invoices are updatable by everyone" ON public.pos_invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pos_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  restaurant jsonb NOT NULL DEFAULT '{}'::jsonb,
  riders jsonb NOT NULL DEFAULT '[]'::jsonb,
  areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  menu_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pos_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.pos_settings TO authenticated;
GRANT ALL ON public.pos_settings TO service_role;
ALTER TABLE public.pos_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "POS settings are readable by everyone" ON public.pos_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "POS settings are insertable by everyone" ON public.pos_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "POS settings are updatable by everyone" ON public.pos_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);