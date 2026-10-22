CREATE TABLE public.public_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  label text NOT NULL DEFAULT '',
  amount integer NOT NULL DEFAULT 0
);
GRANT INSERT ON public.public_events TO anon, authenticated;
GRANT SELECT ON public.public_events TO authenticated;
GRANT ALL ON public.public_events TO service_role;
ALTER TABLE public.public_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors log events" ON public.public_events FOR INSERT TO anon, authenticated
  WITH CHECK (kind IN ('visit','whatsapp_order','track_search') AND length(label) <= 200 AND amount BETWEEN 0 AND 1000000);
CREATE POLICY "Owner reads events" ON public.public_events FOR SELECT TO authenticated
  USING (lower(auth.jwt()->>'email') = 'abubakerusa29@gmail.com');
CREATE INDEX public_events_created_idx ON public.public_events (created_at DESC);