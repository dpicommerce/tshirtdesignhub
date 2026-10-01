CREATE TABLE public.export_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  utr TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  files INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.export_payments TO authenticated;
GRANT ALL ON public.export_payments TO service_role;
ALTER TABLE public.export_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.export_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own payments" ON public.export_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND utr ~ '^[0-9]{12}$' AND amount > 0 AND files > 0);