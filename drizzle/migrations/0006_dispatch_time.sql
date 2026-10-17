ALTER TABLE public.pos_invoices ADD COLUMN IF NOT EXISTS dispatched_at timestamptz;
UPDATE public.pos_invoices SET dispatched_at = created_at + interval '15 minutes' WHERE rider IS NOT NULL AND rider <> '' AND dispatched_at IS NULL;
DROP FUNCTION IF EXISTS public.track_order(integer);
CREATE FUNCTION public.track_order(_order_no integer)
RETURNS TABLE(order_no integer, order_type text, status text, created_at timestamptz, rider text, dispatched_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.order_no, i.order_type, i.status, i.created_at, i.rider, i.dispatched_at FROM public.pos_invoices i
  WHERE i.order_no = _order_no AND i.order_type <> 'Dine-in' ORDER BY i.created_at DESC LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.track_order(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(integer) TO anon, authenticated;