-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create a security definer function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_members.group_id = $1 
    AND group_members.user_id = $2
  );
$function$;

-- Create new RLS policies using the security definer function
CREATE POLICY "Users can view group members of their groups" 
ON public.group_members 
FOR SELECT 
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Group admins can manage members" 
ON public.group_members 
FOR ALL 
USING (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also fix the groups table policy to use the security definer function
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

CREATE POLICY "Users can view groups they are members of" 
ON public.groups 
FOR SELECT 
USING (public.is_group_member(id, auth.uid()));

-- Ensure RLS is enabled
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;