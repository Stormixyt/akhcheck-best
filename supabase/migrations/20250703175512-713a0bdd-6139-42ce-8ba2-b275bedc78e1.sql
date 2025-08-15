-- Allow users to find groups by code for joining purposes
-- This fixes the issue where users can't join groups because they can't find them first

DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Allow users to view groups they are members of OR created
CREATE POLICY "Users can view their groups" 
ON public.groups 
FOR SELECT 
TO authenticated
USING (is_group_member(id, auth.uid()) OR created_by = auth.uid());

-- Allow users to find any group by code (needed for joining)
CREATE POLICY "Users can find groups by code" 
ON public.groups 
FOR SELECT 
TO authenticated
USING (true);