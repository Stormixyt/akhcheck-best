import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Flame, TrendingUp, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

interface LeaderboardMember {
  user_id: string;
  display_name: string;
  current_streak: number;
  total_check_ins: number;
  success_rate: number;
  weekly_points: number;
  monthly_points: number;
  rank: number;
  badge?: string;
}

interface GroupLeaderboardProps {
  groupId: string;
  groupName: string;
}

export const GroupLeaderboard = ({ groupId, groupName }: GroupLeaderboardProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchLeaderboardData();
    }
  }, [groupId, period]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get group members
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner(display_name)
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      if (!groupMembers || groupMembers.length === 0) {
        setMembers([]);
        return;
      }

      // Calculate date ranges
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const monthStart = startOfMonth(today);
      
      let startDate: Date;
      switch (period) {
        case 'daily':
          startDate = today;
          break;
        case 'weekly':
          startDate = weekStart;
          break;
        case 'monthly':
          startDate = monthStart;
          break;
      }

      // Get check-ins for the period
      const { data: checkIns, error: checkInsError } = await supabase
        .from('daily_check_ins')
        .select('user_id, status, check_date, created_at')
        .eq('group_id', groupId)
        .gte('check_date', format(startDate, 'yyyy-MM-dd'))
        .lte('check_date', format(today, 'yyyy-MM-dd'));

      if (checkInsError) throw checkInsError;

      // Calculate stats for each member
      const memberStats = await Promise.all(
        groupMembers.map(async (member) => {
          const memberCheckIns = checkIns?.filter(c => c.user_id === member.user_id) || [];
          
          // Calculate current streak (all-time)
          const { data: allCheckIns } = await supabase
            .from('daily_check_ins')
            .select('status, check_date')
            .eq('user_id', member.user_id)
            .eq('group_id', groupId)
            .order('check_date', { ascending: false });

          let currentStreak = 0;
          if (allCheckIns && allCheckIns.length > 0) {
            let checkDate = new Date();
            for (const checkIn of allCheckIns) {
              const dateStr = checkDate.toISOString().split('T')[0];
              const foundCheckIn = allCheckIns.find(c => c.check_date === dateStr);
              
              if (foundCheckIn && foundCheckIn.status === 'disciplined') {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
          }

          // Calculate period-specific stats
          const disciplinedCount = memberCheckIns.filter(c => c.status === 'disciplined').length;
          const totalCheckIns = memberCheckIns.length;
          const successRate = totalCheckIns > 0 ? (disciplinedCount / totalCheckIns) * 100 : 0;
          
          // Points system: 10 points for disciplined day, -5 for failed day
          const points = disciplinedCount * 10 - (totalCheckIns - disciplinedCount) * 5;
          
          // Determine badge based on performance
          let badge = '';
          if (currentStreak >= 30) badge = '🏆 Legend';
          else if (currentStreak >= 14) badge = '💪 Warrior';
          else if (currentStreak >= 7) badge = '🔥 Strong';
          else if (successRate >= 80) badge = '⭐ Consistent';

          return {
            user_id: member.user_id,
            display_name: member.profiles?.display_name || 'Unknown',
            current_streak: currentStreak,
            total_check_ins: totalCheckIns,
            success_rate: Math.round(successRate),
            weekly_points: points,
            monthly_points: points,
            rank: 0, // Will be set after sorting
            badge
          } as LeaderboardMember;
        })
      );

      // Sort by points (descending) and assign ranks
      const sortedMembers = memberStats
        .sort((a, b) => {
          const aPoints = period === 'weekly' ? a.weekly_points : a.monthly_points;
          const bPoints = period === 'weekly' ? b.weekly_points : b.monthly_points;
          return bPoints - aPoints;
        })
        .map((member, index) => ({
          ...member,
          rank: index + 1
        }));

      setMembers(sortedMembers);
      
      // Find current user's rank
      const currentUserRank = sortedMembers.find(m => m.user_id === user?.id)?.rank || null;
      setUserRank(currentUserRank);

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const getPointsForPeriod = (member: LeaderboardMember) => {
    return period === 'weekly' ? member.weekly_points : member.monthly_points;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Group Leaderboard
            </CardTitle>
            <CardDescription>{groupName} • {members.length} members</CardDescription>
          </div>
          {userRank && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Your rank: #{userRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Period Selector */}
        <Tabs value={period} onValueChange={(value) => setPeriod(value as 'daily' | 'weekly' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="text-xs">Today</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">This Week</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard */}
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet this {period.replace('ly', '')}</p>
              <p className="text-sm">Be the first to check in!</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.user_id}
                className={`
                  flex items-center p-3 rounded-lg border transition-all duration-200
                  ${member.user_id === user?.id 
                    ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' 
                    : 'bg-muted/20 border-muted/30 hover:bg-muted/30'
                  }
                  ${index < 3 ? 'shadow-sm' : ''}
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(member.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 mx-3">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                    {member.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {member.display_name}
                      {member.user_id === user?.id && (
                        <span className="text-primary ml-1">(You)</span>
                      )}
                    </p>
                    {member.badge && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {member.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {member.current_streak} streak
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {member.success_rate}% success
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="font-bold text-sm text-primary">
                    {getPointsForPeriod(member)} pts
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.total_check_ins} check-ins
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Points Explanation */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Scoring System</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✅ Disciplined day: +10 points</div>
            <div>❌ Failed day: -5 points</div>
            <div>🏆 Rankings update every hour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
