import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  onboarding_completed?: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  anonymous_mode: boolean;
  repeat_warnings: boolean;
  daily_reminder: boolean;
  reminder_time: string;
  theme: 'green' | 'blue' | 'purple';
  dark_mode?: boolean;
  has_seen_v11_update: boolean;
  has_seen_v12_update: boolean;
}

export interface UserGoal {
  id: string;
  user_id: string;
  name: string;
  completed: boolean;
  is_default: boolean;
  completed_at: string | null;
}

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (goalsError) {
        throw goalsError;
      }

      setProfile(profileData);
      setPreferences(preferencesData as UserPreferences);
      setGoals(goalsData || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        });

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const addGoal = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          name,
          completed: false,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Goal added successfully",
      });
    } catch (error: any) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId
            ? { ...goal, completed, completed_at: completed ? new Date().toISOString() : null }
            : goal
        )
      );
    } catch (error: any) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  return {
    profile,
    preferences,
    goals,
    loading,
    updateProfile,
    updatePreferences,
    addGoal,
    toggleGoal,
    deleteGoal,
    refetch: fetchUserData,
  };
};