ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reply text NOT NULL DEFAULT '' CHECK (char_length(reply) <= 500);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS service text NOT NULL DEFAULT '' CHECK (service IN ('', 'Delivery', 'Takeaway', 'Dine-in'));
DROP POLICY IF EXISTS "Staff update reviews" ON public.reviews;
CREATE POLICY "Staff update reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT UPDATE ON public.reviews TO authenticated;
DROP FUNCTION IF EXISTS public.public_reviews();
CREATE FUNCTION public.public_reviews() RETURNS TABLE(id uuid, created_at timestamptz, name text, rating integer, comment text, verified boolean, starred boolean, reply text, service text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.created_at, r.name, r.rating, r.comment,
    (r.invoice_no <> '' AND EXISTS (SELECT 1 FROM public.pos_invoices i WHERE i.order_no::text = r.invoice_no)) AS verified,
    r.starred, r.reply, r.service
  FROM public.reviews r WHERE NOT r.hidden ORDER BY r.starred DESC, r.created_at DESC LIMIT 100
$$;
GRANT EXECUTE ON FUNCTION public.public_reviews() TO anon, authenticated;
