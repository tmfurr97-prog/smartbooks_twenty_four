
-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'Other',
  merchant_name TEXT,
  is_tax_deductible BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT true,
  tax_category TEXT NOT NULL DEFAULT 'Other',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mileage trips table
CREATE TABLE public.mileage_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  distance_miles NUMERIC(10,2) NOT NULL DEFAULT 0,
  purpose TEXT,
  trip_type TEXT NOT NULL DEFAULT 'business',
  is_round_trip BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mileage_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
ON public.mileage_trips FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
ON public.mileage_trips FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
ON public.mileage_trips FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
ON public.mileage_trips FOR DELETE USING (auth.uid() = user_id);

-- Vehicle expenses table
CREATE TABLE public.vehicle_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_type TEXT NOT NULL DEFAULT 'gas',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  vendor TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicle expenses"
ON public.vehicle_expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle expenses"
ON public.vehicle_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle expenses"
ON public.vehicle_expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle expenses"
ON public.vehicle_expenses FOR DELETE USING (auth.uid() = user_id);

-- Tax professional access table
CREATE TABLE public.tax_professional_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_email TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'view',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_professional_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own professional access"
ON public.tax_professional_access FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own professional access"
ON public.tax_professional_access FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professional access"
ON public.tax_professional_access FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own professional access"
ON public.tax_professional_access FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_tax_professional_access_updated_at
BEFORE UPDATE ON public.tax_professional_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
