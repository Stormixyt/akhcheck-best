-- Add policies to allow users to edit and delete their own messages
CREATE POLICY "Users can update their own messages" 
ON public.group_messages 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.group_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add edited timestamp and deleted status columns
ALTER TABLE public.group_messages 
ADD COLUMN edited_at timestamp with time zone,
ADD COLUMN deleted_for_everyone boolean DEFAULT false,
ADD COLUMN deleted_for_user jsonb DEFAULT '[]'::jsonb;