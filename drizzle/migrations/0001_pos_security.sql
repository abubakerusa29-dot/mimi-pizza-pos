CREATE TABLE public.pos_security (
  id integer PRIMARY KEY DEFAULT 1,
  pin_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pos_security TO service_role;
ALTER TABLE public.pos_security ENABLE ROW LEVEL SECURITY;
INSERT INTO public.pos_security (id, pin_hash) SELECT 1, 'c8d0e130899b46a2640bb8a279895a99e95f101d58d778aa1e2a9d063a9a7bf1';