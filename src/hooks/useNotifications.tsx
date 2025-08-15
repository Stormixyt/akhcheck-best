import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'friend_update' | 'streak_milestone' | 'daily_challenge' | 'friend_boost' | 'verse_reminder' | 'goal_completed' | 'motivation' | 'group_checkin';
  message: string;
  created_at: string;
  read: boolean;
  metadata?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const generateNotifications = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's check-ins from today
      const { data: checkIns } = await supabase
        .from('daily_check_ins')
        .select('status, created_at')
        .eq('user_id', user.id)
        .eq('check_date', today);

      // Get group check-ins for notifications
      const { data: groupCheckIns } = await supabase
        .from('daily_check_ins')
        .select(`
          status, 
          created_at,
          group_id,
          profiles!inner(display_name)
        `)
        .neq('user_id', user.id)
        .eq('check_date', today)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user's current streak
      const { data: allCheckIns } = await supabase
        .from('daily_check_ins')
        .select('status, check_date')
        .eq('user_id', user.id)
        .is('group_id', null)
        .order('check_date', { ascending: false });

      // Calculate streak
      let streak = 0;
      const currentDate = new Date();
      if (allCheckIns && allCheckIns.length > 0) {
        for (const checkIn of allCheckIns) {
          const checkDate = currentDate.toISOString().split('T')[0];
          if (checkIn.check_date === checkDate && checkIn.status === 'disciplined') {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      const generatedNotifications: Notification[] = [];

      // Check-in notifications
      if (checkIns && checkIns.length > 0) {
        const latestCheckIn = checkIns[0];
        if (latestCheckIn.status === 'disciplined') {
          generatedNotifications.push({
            id: `checkin-${today}`,
            type: 'goal_completed',
            message: 'Daily check-in completed! Well done, akhi 💪',
            created_at: latestCheckIn.created_at,
            read: false,
          });
        }
      }

      // Streak milestone notifications
      if (streak > 0 && [7, 14, 30, 60, 100].includes(streak)) {
        generatedNotifications.push({
          id: `streak-${streak}`,
          type: 'streak_milestone',
          message: `Amazing! ${streak} days streak achieved! 🔥`,
          created_at: new Date().toISOString(),
          read: false,
        });
      }

      // Group check-in notifications
      if (groupCheckIns) {
        groupCheckIns.forEach((checkIn, index) => {
          if (index < 3) { // Show latest 3
            const name = (checkIn.profiles as any)?.display_name || 'Someone';
            const status = checkIn.status === 'disciplined' ? 'stayed disciplined' : 'struggled today';
            const emoji = checkIn.status === 'disciplined' ? '💪' : '💚';
            
            generatedNotifications.push({
              id: `group-checkin-${checkIn.created_at}`,
              type: 'group_checkin',
              message: `${name} ${status} ${emoji}`,
              created_at: checkIn.created_at,
              read: false,
            });
          }
        });
      }

      // Daily challenge notification
      generatedNotifications.push({
        id: `challenge-${today}`,
        type: 'daily_challenge',
        message: "Today's challenge: Read 5 minutes Quran ⏰",
        created_at: new Date().toISOString(),
        read: false,
      });

      // Motivational reminder
      const motivationalMessages = [
        "Reminder: 'Discipline beats motivation every day'",
        "Remember: Small consistent steps lead to big changes",
        "Keep going, akhi. Every day counts!",
        "Stay strong. You're building character.",
      ];
      
      generatedNotifications.push({
        id: `motivation-${today}`,
        type: 'motivation',
        message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        created_at: new Date().toISOString(),
        read: false,
      });

      // Sort by most recent first
      generatedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error generating notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateNotifications();
    }
  }, [user]);

  return {
    notifications,
    loading,
    refetch: generateNotifications,
  };
};