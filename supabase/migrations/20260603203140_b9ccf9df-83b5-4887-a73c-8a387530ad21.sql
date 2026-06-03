ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_id uuid;

DROP POLICY IF EXISTS "Users can view messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "View own or addressed messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
  OR (recipient_id IS NULL AND (public.has_role(auth.uid(), 'preparer') OR public.has_role(auth.uid(), 'admin')))
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Send messages as self"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);