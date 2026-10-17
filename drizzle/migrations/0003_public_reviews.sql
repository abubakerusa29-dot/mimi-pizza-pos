CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  invoice_no text NOT NULL DEFAULT '' CHECK (char_length(invoice_no) <= 12),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 3 AND 500)
);
GRANT INSERT ON public.reviews TO anon, authenticated;
GRANT SELECT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff delete reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE OR REPLACE FUNCTION public.public_reviews()
RETURNS TABLE(id uuid, created_at timestamptz, name text, rating int, comment text, verified boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.created_at, r.name, r.rating, r.comment,
    (r.invoice_no <> '' AND EXISTS (SELECT 1 FROM public.pos_invoices i WHERE i.order_no::text = r.invoice_no)) AS verified
  FROM public.reviews r ORDER BY r.created_at DESC LIMIT 30
$$;
GRANT EXECUTE ON FUNCTION public.public_reviews() TO anon, authenticated;