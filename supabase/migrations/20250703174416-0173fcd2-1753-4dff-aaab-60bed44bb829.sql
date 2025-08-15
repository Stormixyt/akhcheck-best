-- Fix the groups table RLS policy for creation
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

-- Create a proper INSERT policy that allows authenticated users to create groups
CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Also ensure the groups table allows viewing groups you created even if not a member yet
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

CREATE POLICY "Users can view groups they are members of" 
ON public.groups 
FOR SELECT 
TO authenticated
USING (
  -- Can view if you're a member OR if you created it
  public.is_group_member(id, auth.uid()) OR created_by = auth.uid()
);