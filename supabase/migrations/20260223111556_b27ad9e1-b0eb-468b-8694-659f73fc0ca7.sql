
-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Clients can view their own messages + messages sent TO them by preparers
-- Preparers/admins can view all messages
CREATE POLICY "Clients can view their own messages"
ON public.messages FOR SELECT
USING (
  auth.uid() = sender_id
  OR public.has_role(auth.uid(), 'preparer')
  OR public.has_role(auth.uid(), 'admin')
);

-- Authenticated users can send messages
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
