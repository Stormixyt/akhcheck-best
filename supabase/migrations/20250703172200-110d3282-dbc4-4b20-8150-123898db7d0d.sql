-- Fix infinite recursion in group_members RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_group_admin(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_members.group_id = $1 
    AND group_members.user_id = $2 
    AND group_members.role = 'admin'
  );
$$;

-- Recreate the policy using the function
CREATE POLICY "Group admins can manage members" 
ON public.group_members 
FOR ALL 
USING (public.is_group_admin(group_members.group_id, auth.uid()));

-- Also fix the groups policy
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

CREATE POLICY "Group admins can update groups" 
ON public.groups 
FOR UPDATE 
USING (public.is_group_admin(groups.id, auth.uid()));