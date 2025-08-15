import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Flame, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupNotificationsProps {
  groupId: string;
  userId: string;
}

interface GroupStats {
  totalMembers: number;
  checkedInToday: number;
  allMaintainedStreak: boolean;
  streakLosers: string[];
}

export const GroupNotifications = ({ groupId, userId }: GroupNotificationsProps) => {
  const [notification, setNotification] = useState<{
    type: 'all-checked-in' | 'streak-update';
    stats: GroupStats;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!groupId || !userId) return;

    const channel = supabase
      .channel(`group_notifications_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_check_ins',
          filter: `group_id=eq.${groupId}`
        },
        async () => {
          await checkGroupStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, userId]);

  const checkGroupStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get total members
      const { count: totalMembers } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      // Get today's check-ins
      const { data: checkIns } = await supabase
        .from('daily_check_ins')
        .select('user_id, status')
        .eq('group_id', groupId)
        .eq('check_date', today);

      if (!checkIns || !totalMembers) return;

      const checkedInToday = checkIns.length;
      const streakLosers = checkIns
        .filter(checkIn => checkIn.status === 'gooned')
        .map(checkIn => checkIn.user_id);

      const stats: GroupStats = {
        totalMembers,
        checkedInToday,
        allMaintainedStreak: streakLosers.length === 0,
        streakLosers
      };

      // Show notification if everyone has checked in
      if (checkedInToday === totalMembers) {
        setNotification({
          type: 'all-checked-in',
          stats
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => setNotification(null), 10000);
      }
    } catch (error) {
      console.error('Error checking group status:', error);
    }
  };

  if (!notification) return null;

  const { stats } = notification;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <GlassCard className="p-4 border-accent/20 bg-accent/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {stats.allMaintainedStreak ? (
                <Trophy className="w-5 h-5 text-warning" />
              ) : (
                <Flame className="w-5 h-5 text-destructive" />
              )}
              <h3 className="font-semibold text-foreground">
                Everyone has checked in!
              </h3>
            </div>
            
            <div className="space-y-1 text-sm">
              {stats.allMaintainedStreak ? (
                <p className="text-success font-medium">
                  🎉 Everyone maintained their streak today! MashaAllah!
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-destructive">
                    💔 {stats.streakLosers.length} brother(s) lost their streak today
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Let's support each other tomorrow 🤝
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotification(null)}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};