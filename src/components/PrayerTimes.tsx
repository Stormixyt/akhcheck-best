import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Sunrise, Sun, Sunset, Moon, Star, Coffee, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface PrayerTime {
  name: string;
  time: string;
  icon: React.ReactNode;
  passed: boolean;
}

export const PrayerTimes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState<string>("Netherlands");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFasting, setIsFasting] = useState(false);
  const [fastingStreak, setFastingStreak] = useState(0);
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    fetchPrayerTimes();
    checkRamadanStatus();
    if (user) {
      checkFastingStatus();
    }
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchPrayerTimes = async () => {
    try {
      // Get user's location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await loadPrayerTimesForLocation(position.coords.latitude, position.coords.longitude);
          },
          async () => {
            // Fallback to Amsterdam, Netherlands if location access denied
            await loadPrayerTimesForCity('Amsterdam', 'Netherlands');
          }
        );
      } else {
        // Fallback to Amsterdam, Netherlands if geolocation not supported
        await loadPrayerTimesForCity('Amsterdam', 'Netherlands');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      // Use fallback static times if API fails
      setFallbackTimes();
    }
  };

  const loadPrayerTimesForLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3&school=1`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerTimesFromAPI(data.data);
        setLocation(`${data.data.meta.city || 'Your location'}`);
      } else {
        throw new Error('API response not successful');
      }
    } catch (error) {
      console.error('Error loading prayer times for location:', error);
      // Fallback to Amsterdam
      await loadPrayerTimesForCity('Amsterdam', 'Netherlands');
    }
  };

  const loadPrayerTimesForCity = async (city: string, country: string) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=3&school=1`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerTimesFromAPI(data.data);
        setLocation(`${city}, ${country}`);
      } else {
        throw new Error('API response not successful');
      }
    } catch (error) {
      console.error('Error loading prayer times for city:', error);
      setFallbackTimes();
    }
  };

  const setPrayerTimesFromAPI = (data: any) => {
    const timings = data.timings;
    const currentTimeString = currentTime.toTimeString().slice(0, 5);
    
    const times = [
      { 
        name: t('fajr'), 
        time: formatTime(timings.Fajr), 
        icon: <Sunrise className="w-4 h-4" />, 
        passed: currentTimeString > formatTime(timings.Fajr)
      },
      { 
        name: t('dhuhr'), 
        time: formatTime(timings.Dhuhr), 
        icon: <Sun className="w-4 h-4" />, 
        passed: currentTimeString > formatTime(timings.Dhuhr)
      },
      { 
        name: t('asr'), 
        time: formatTime(timings.Asr), 
        icon: <Sun className="w-4 h-4" />, 
        passed: currentTimeString > formatTime(timings.Asr)
      },
      { 
        name: t('maghrib'), 
        time: formatTime(timings.Maghrib), 
        icon: <Sunset className="w-4 h-4" />, 
        passed: currentTimeString > formatTime(timings.Maghrib)
      },
      { 
        name: t('isha'), 
        time: formatTime(timings.Isha), 
        icon: <Moon className="w-4 h-4" />, 
        passed: currentTimeString > formatTime(timings.Isha)
      }
    ];

    setPrayerTimes(times);
  };

  const formatTime = (timeString: string) => {
    // Remove timezone info and seconds, return HH:MM format
    return timeString.split(' ')[0].slice(0, 5);
  };

  const setFallbackTimes = () => {
    const currentTimeString = currentTime.toTimeString().slice(0, 5);
    const times = [
      { name: "Fajr", time: "06:00", icon: <Sunrise className="w-4 h-4" />, passed: currentTimeString > "06:00" },
      { name: "Dhuhr", time: "12:30", icon: <Sun className="w-4 h-4" />, passed: currentTimeString > "12:30" },
      { name: "Asr", time: "15:00", icon: <Sun className="w-4 h-4" />, passed: currentTimeString > "15:00" },
      { name: "Maghrib", time: "17:30", icon: <Sunset className="w-4 h-4" />, passed: currentTimeString > "17:30" },
      { name: "Isha", time: "19:00", icon: <Moon className="w-4 h-4" />, passed: currentTimeString > "19:00" }
    ];
    setPrayerTimes(times);
    setLocation("Netherlands (Approximate)");
  };

  const checkRamadanStatus = () => {
    // Simple Ramadan detection - in a real app, this would use Islamic calendar API
    const now = new Date();
    const currentYear = now.getFullYear();
    // Approximate Ramadan dates for 2024/2025 - in production, use proper Islamic calendar API
    const ramadanStart = new Date(currentYear, 2, 10); // Rough estimate
    const ramadanEnd = new Date(currentYear, 3, 9);
    setIsRamadan(now >= ramadanStart && now <= ramadanEnd);
  };

  const checkFastingStatus = async () => {
    if (!user) return;
    
    try {
      // For now, we'll use localStorage to track fasting until we add the table
      const today = new Date().toISOString().split('T')[0];
      const fastingData = localStorage.getItem(`fasting_${user.id}_${today}`);
      
      if (fastingData) {
        setIsFasting(JSON.parse(fastingData));
      }

      // Simple streak calculation from localStorage
      let streak = 0;
      let checkDate = new Date();
      
      while (streak < 365) { // Limit to 1 year
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayFasting = localStorage.getItem(`fasting_${user.id}_${dateStr}`);
        
        if (dayFasting && JSON.parse(dayFasting)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setFastingStreak(streak);
    } catch (error) {
      console.error('Error checking fasting status:', error);
    }
  };

  const toggleFasting = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const newFastingStatus = !isFasting;
      
      // Store in localStorage for now
      localStorage.setItem(`fasting_${user.id}_${today}`, JSON.stringify(newFastingStatus));
      
      setIsFasting(newFastingStatus);
      
      if (newFastingStatus) {
        setFastingStreak(prev => prev + 1);
        toast({
          title: t('fasting_recorded'),
          description: t('may_allah_make_easy'),
        });
      } else {
        toast({
          title: t('fasting_status_updated'),
          description: t('fast_not_observed'),
        });
      }
      
      // Recalculate streak
      await checkFastingStatus();
    } catch (error) {
      console.error('Error updating fasting status:', error);
      toast({
        title: "Error",
        description: "Failed to update fasting status",
        variant: "destructive",
      });
    }
  };

  const getNextPrayer = () => {
    const nextPrayer = prayerTimes.find(prayer => !prayer.passed);
    return nextPrayer || prayerTimes[0]; // If all passed, next is Fajr tomorrow
  };

  const getSuhoorTime = () => {
    const fajrPrayer = prayerTimes.find(p => p.name === "Fajr");
    if (fajrPrayer) {
      // Suhoor ends approximately 10 minutes before Fajr
      const [hours, minutes] = fajrPrayer.time.split(':').map(Number);
      const suhoorTime = new Date();
      suhoorTime.setHours(hours, minutes - 10);
      return suhoorTime.toTimeString().slice(0, 5);
    }
    return "05:50"; // Fallback
  };

  const getIftarTime = () => {
    const maghribPrayer = prayerTimes.find(p => p.name === "Maghrib");
    return maghribPrayer?.time || "17:30"; // Fallback
  };

  const nextPrayer = getNextPrayer();

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">{t('prayer_times')}</h3>
            {isRamadan && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 text-xs">
                {t('ramadan')}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>

        {/* Next Prayer Highlight */}
        {nextPrayer && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              {nextPrayer.icon}
              <span className="text-sm font-medium text-primary">{t('next_prayer')}: {nextPrayer.name}</span>
            </div>
            <div className="text-lg font-bold text-foreground">{nextPrayer.time}</div>
          </div>
        )}

        {/* All Prayer Times */}
        <div className="grid grid-cols-5 gap-2">
          {prayerTimes.map((prayer, index) => (
            <div
              key={index}
              className={`text-center p-2 rounded-lg transition-all duration-200 ${
                prayer.passed 
                  ? 'bg-muted/30 text-muted-foreground' 
                  : prayer === nextPrayer
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-accent/10 text-foreground hover:bg-accent/20'
              }`}
            >
              <div className="flex justify-center mb-1">
                {prayer.icon}
              </div>
              <div className="text-xs font-medium mb-1">{prayer.name}</div>
              <div className="text-xs font-mono">{prayer.time}</div>
            </div>
          ))}
        </div>

        {/* Fasting Tracker */}
        {user && (
          <div className="border-t border-accent/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{t('fasting_tracker')}</span>
                {fastingStreak > 0 && (
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 text-xs">
                    {fastingStreak} {t('day_streak_fasting')}
                  </Badge>
                )}
              </div>
              <Button
                variant={isFasting ? "default" : "outline"}
                size="sm"
                onClick={toggleFasting}
                className="h-7 px-3 text-xs"
              >
                {isFasting ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> {t('fasting')}</>
                ) : (
                  <>{t('mark_fasting')}</>
                )}
              </Button>
            </div>
            
            {isFasting && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-center">
                  <div className="text-blue-600 font-medium">{t('suhoor_ends')}</div>
                  <div className="font-mono">{getSuhoorTime()}</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded p-2 text-center">
                  <div className="text-orange-600 font-medium">{t('iftar_time')}</div>
                  <div className="font-mono">{getIftarTime()}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Time */}
        <div className="text-center pt-2 border-t border-accent/10">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{currentTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};