-- Create group_goals table
CREATE TABLE public.group_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL DEFAULT 1,
  current_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.group_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view goals in their groups" 
ON public.group_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_goals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can create goals" 
ON public.group_goals 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_goals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can update goals" 
ON public.group_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_goals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_group_goals_updated_at
BEFORE UPDATE ON public.group_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();