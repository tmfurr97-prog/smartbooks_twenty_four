
-- Create estimated_tax_payments table
CREATE TABLE public.estimated_tax_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  due_date DATE NOT NULL,
  estimated_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC DEFAULT NULL,
  paid_date DATE DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, quarter)
);

-- Enable RLS
ALTER TABLE public.estimated_tax_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tax payments"
  ON public.estimated_tax_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax payments"
  ON public.estimated_tax_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax payments"
  ON public.estimated_tax_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax payments"
  ON public.estimated_tax_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_estimated_tax_payments_updated_at
  BEFORE UPDATE ON public.estimated_tax_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
