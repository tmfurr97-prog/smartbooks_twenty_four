CREATE TABLE public.information_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_type TEXT NOT NULL DEFAULT '1099-NEC',
  taxx_year INTEGER NOT NULL,
  payer_name TEXT NOT NULL,
  payer_ein TEXT NOT NULL,
  payer_address1 TEXT NOT NULL,
  payer_city TEXT NOT NULL,
  payer_state TEXT NOT NULL,
  payer_zip TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_tin TEXT NOT NULL,
  recipient_tin_type TEXT NOT NULL DEFAULT 'SSN',
  recipient_address1 TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  recipient_state TEXT NOT NULL,
  recipient_zip TEXT NOT NULL,
  recipient_email TEXT,
  nonemployee_compensation NUMERIC(12,2) NOT NULL DEFAULT 0,
  federal_tax_withheld NUMERIC(12,2) NOT NULL DEFAULT 0,
  state_tax_withheld NUMERIC(12,2) NOT NULL DEFAULT 0,
  state_code TEXT,
  state_id TEXT,
  submission_id TEXT,
  record_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  environment TEXT NOT NULL DEFAULT 'sandbox',
  error_message TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.information_returns TO authenticated;
GRANT ALL ON public.information_returns TO service_role;

ALTER TABLE public.information_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own information returns"
ON public.information_returns FOR ALL
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'preparer') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'preparer') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_information_returns_updated_at
BEFORE UPDATE ON public.information_returns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();