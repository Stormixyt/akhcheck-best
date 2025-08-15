-- Drop ALL existing policies on group_members to start fresh
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

-- Drop groups policies too
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

-- Create security definer function for group membership
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

-- Recreate group_members policies using security definer functions
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

-- Recreate groups policies
CREATE POLICY "Users can view groups they are members of" 
ON public.groups 
FOR SELECT 
USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Group admins can update groups" 
ON public.groups 
FOR UPDATE 
USING (public.is_group_admin(id, auth.uid()));

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);