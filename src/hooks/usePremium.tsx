import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PremiumFeatures {
  ai_coach: boolean;
  custom_challenges: boolean;
  masjid_leaderboards: boolean;
  weekly_reports: boolean;
  voice_checkins: boolean;
  group_lock_mode: boolean;
  streak_revival_tokens: number;
  theme_marketplace: boolean;
  advanced_privacy: boolean;
}

interface PremiumContextType {
  isPremium: boolean;
  features: PremiumFeatures;
  loading: boolean;
  activatePremium: () => Promise<void>;
  deactivatePremium: () => Promise<void>;
  hasFeature: (feature: keyof PremiumFeatures) => boolean;
}

const defaultFeatures: PremiumFeatures = {
  ai_coach: false,
  custom_challenges: false,
  masjid_leaderboards: false,
  weekly_reports: false,
  voice_checkins: false,
  group_lock_mode: false,
  streak_revival_tokens: 0,
  theme_marketplace: false,
  advanced_privacy: false
};

const premiumFeatures: PremiumFeatures = {
  ai_coach: true,
  custom_challenges: true,
  masjid_leaderboards: true,
  weekly_reports: true,
  voice_checkins: true,
  group_lock_mode: true,
  streak_revival_tokens: 3,
  theme_marketplace: true,
  advanced_privacy: true
};

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  features: defaultFeatures,
  loading: true,
  activatePremium: async () => {},
  deactivatePremium: async () => {},
  hasFeature: () => false,
});

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [features, setFeatures] = useState<PremiumFeatures>(defaultFeatures);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setIsPremium(false);
      setFeatures(defaultFeatures);
      setLoading(false);
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    try {
      // Check user preferences for premium flag
      const { data, error } = await supabase
        .from('user_preferences')
        .select('premium, premium_expires_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isCurrentlyPremium = data?.premium === true && 
        (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date());

      setIsPremium(isCurrentlyPremium);
      setFeatures(isCurrentlyPremium ? premiumFeatures : defaultFeatures);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
      setFeatures(defaultFeatures);
    } finally {
      setLoading(false);
    }
  };

  const activatePremium = async () => {
    if (!user) return;
    
    try {
      // In a real app, this would handle payment processing
      // For now, we'll just activate premium for demo purposes
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          premium: true,
          premium_expires_at: expiresAt.toISOString(),
          premium_activated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsPremium(true);
      setFeatures(premiumFeatures);
    } catch (error) {
      console.error('Error activating premium:', error);
      throw error;
    }
  };

  const deactivatePremium = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          premium: false,
          premium_expires_at: null
        });

      if (error) throw error;

      setIsPremium(false);
      setFeatures(defaultFeatures);
    } catch (error) {
      console.error('Error deactivating premium:', error);
      throw error;
    }
  };

  const hasFeature = (feature: keyof PremiumFeatures): boolean => {
    return features[feature] === true || (typeof features[feature] === 'number' && features[feature] > 0);
  };

  return (
    <PremiumContext.Provider value={{
      isPremium,
      features,
      loading,
      activatePremium,
      deactivatePremium,
      hasFeature,
    }}>
      {children}
    </PremiumContext.Provider>
  );
};
