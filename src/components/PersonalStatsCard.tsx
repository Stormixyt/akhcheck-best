import { useState, useEffect } from "react";
import { Calendar, TrendingUp, BarChart3, Download, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface DailyCheckIn {
  check_date: string;
  status: 'disciplined' | 'gooned';
  created_at: string;
}

interface StatsData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  successRate: number;
  weeklyData: Array<{ date: string; success: boolean }>;
  monthlyData: Array<{ month: string; successRate: number }>;
  recentCheckIns: DailyCheckIn[];
}

export const PersonalStatsCard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, selectedPeriod]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get all personal check-ins (non-group)
      const { data: checkIns, error } = await supabase
        .from('daily_check_ins')
        .select('check_date, status, created_at')
        .eq('user_id', user.id)
        .is('group_id', null)
        .order('check_date', { ascending: false });

      if (error) throw error;

      if (!checkIns || checkIns.length === 0) {
        setStats({
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          successRate: 0,
          weeklyData: [],
          monthlyData: [],
          recentCheckIns: []
        });
        return;
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date(today);
      
      for (const checkIn of checkIns) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const foundCheckIn = checkIns.find(c => c.check_date === dateStr);
        
        if (foundCheckIn && foundCheckIn.status === 'disciplined') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const sortedCheckIns = [...checkIns].sort((a, b) => 
        new Date(a.check_date).getTime() - new Date(b.check_date).getTime()
      );

      for (let i = 0; i < sortedCheckIns.length; i++) {
        if (sortedCheckIns[i].status === 'disciplined') {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate success rate
      const disciplinedDays = checkIns.filter(c => c.status === 'disciplined').length;
      const successRate = checkIns.length > 0 ? (disciplinedDays / checkIns.length) * 100 : 0;

      // Generate weekly data for calendar view
      const weekStart = subDays(today, 6);
      const weeklyData = eachDayOfInterval({ start: weekStart, end: today }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const checkIn = checkIns.find(c => c.check_date === dateStr);
        return {
          date: dateStr,
          success: checkIn?.status === 'disciplined'
        };
      });

      // Generate monthly data for trends
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subDays(today, i * 30));
        const monthEnd = endOfMonth(monthStart);
        const monthCheckIns = checkIns.filter(c => {
          const checkDate = new Date(c.check_date);
          return checkDate >= monthStart && checkDate <= monthEnd;
        });
        
        const monthSuccess = monthCheckIns.filter(c => c.status === 'disciplined').length;
        const monthTotal = monthCheckIns.length;
        const monthRate = monthTotal > 0 ? (monthSuccess / monthTotal) * 100 : 0;
        
        monthlyData.push({
          month: format(monthStart, 'MMM'),
          successRate: Math.round(monthRate)
        });
      }

      setStats({
        currentStreak,
        longestStreak,
        totalDays: checkIns.length,
        successRate: Math.round(successRate),
        weeklyData,
        monthlyData,
        recentCheckIns: checkIns.slice(0, 10) as DailyCheckIn[]
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStats = async () => {
    if (!stats) return;
    
    // Generate CSV data
    const csvData = [
      ['Date', 'Status', 'Current Streak', 'Success Rate'],
      ...stats.recentCheckIns.map(checkIn => [
        checkIn.check_date,
        checkIn.status,
        stats.currentStreak.toString(),
        `${stats.successRate}%`
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `akhcheck-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="glass-card hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('personal_stats')}
            </CardTitle>
            <CardDescription>{t('your_discipline_journey')}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportStats}
            className="h-8 px-3"
          >
            <Download className="w-4 h-4 mr-1" />
            {t('export')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('current_streak')}</p>
            <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">{t('days')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('success_rate')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.successRate}%</p>
            <Progress value={stats.successRate} className="h-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-xl font-semibold">{stats.longestStreak} days</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Check-ins</p>
            <p className="text-xl font-semibold">{stats.totalDays}</p>
          </div>
        </div>

        {/* Calendar View */}
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="week" className="space-y-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              Last 7 days
            </div>
            <div className="grid grid-cols-7 gap-1">
              {stats.weeklyData.map((day, index) => (
                <div
                  key={day.date}
                  className={`
                    aspect-square rounded-sm border text-xs flex items-center justify-center
                    ${day.success 
                      ? 'bg-green-500/20 border-green-500/30 text-green-600' 
                      : 'bg-red-500/20 border-red-500/30 text-red-600'
                    }
                  `}
                >
                  {format(new Date(day.date), 'dd')}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              6-month trend
            </div>
            <div className="space-y-2">
              {stats.monthlyData.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={month.successRate} className="w-16 h-2" />
                    <span className="text-sm font-medium w-8">{month.successRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Achievements
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.currentStreak >= 7 && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                🔥 Week Warrior
              </Badge>
            )}
            {stats.currentStreak >= 30 && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                💪 Month Master
              </Badge>
            )}
            {stats.successRate >= 80 && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">
                ⭐ Consistency Champion
              </Badge>
            )}
            {stats.longestStreak >= 50 && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">
                🏆 Discipline Legend
              </Badge>
            )}
            {stats.totalDays >= 100 && (
              <Badge variant="secondary" className="bg-pink-500/20 text-pink-600">
                🎯 Century Club
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
