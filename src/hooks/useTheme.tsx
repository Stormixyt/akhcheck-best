import { useEffect } from 'react';
import { useUserData } from './useUserData';

const themeColors = {
  green: {
    primary: '140 60% 55%',
    primaryGlow: '140 60% 70%',
    accent: '150 50% 50%',
  },
  blue: {
    primary: '220 80% 60%',
    primaryGlow: '220 80% 75%',
    accent: '210 70% 55%',
  },
  purple: {
    primary: '280 100% 70%',
    primaryGlow: '300 100% 80%',
    accent: '270 80% 60%',
  },
};

export const useTheme = () => {
  const { preferences, updatePreferences } = useUserData();

  useEffect(() => {
    const theme = preferences?.theme || 'green';
    const darkMode = preferences?.dark_mode || false;
    const colors = themeColors[theme as keyof typeof themeColors];
    
    if (colors) {
      const root = document.documentElement;
      
      // Apply dark/light mode
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Apply color theme
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-glow', colors.primaryGlow);
      root.style.setProperty('--accent', colors.accent);
      
      // Update gradient
      root.style.setProperty(
        '--gradient-primary', 
        `linear-gradient(135deg, hsl(${colors.primary}) 0%, hsl(${colors.primaryGlow}) 50%, hsl(${colors.accent}) 100%)`
      );
    }
  }, [preferences?.theme, preferences?.dark_mode]);

  const toggleDarkMode = async () => {
    const newDarkMode = !preferences?.dark_mode;
    await updatePreferences({ dark_mode: newDarkMode });
  };

  const changeTheme = async (newTheme: 'green' | 'blue' | 'purple') => {
    await updatePreferences({ theme: newTheme });
  };

  return { 
    theme: preferences?.theme || 'green', 
    darkMode: preferences?.dark_mode || false,
    toggleDarkMode,
    changeTheme,
  };
};