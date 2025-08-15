import { useState } from 'react';

const dailyChallenges = [
  {
    id: 'prayer-ontime',
    title: 'Pray on Time',
    description: 'Complete all 5 daily prayers on time',
    emoji: '🕌',
    difficulty: 'medium'
  },
  {
    id: 'quran-reading',
    title: 'Quran Study',
    description: 'Read at least 5 minutes of Quran with reflection',
    emoji: '📖',
    difficulty: 'easy'
  },
  {
    id: 'dhikr-session',
    title: 'Dhikr Practice',
    description: 'Spend 10 minutes in remembrance of Allah',
    emoji: '📿',
    difficulty: 'easy'
  },
  {
    id: 'charity-act',
    title: 'Act of Charity',
    description: 'Help someone or donate to a good cause',
    emoji: '🤲',
    difficulty: 'medium'
  },
  {
    id: 'physical-exercise',
    title: 'Physical Exercise',
    description: 'Exercise for at least 20 minutes',
    emoji: '💪',
    difficulty: 'medium'
  },
  {
    id: 'knowledge-seeking',
    title: 'Seek Knowledge',
    description: 'Learn something new about Islam or beneficial knowledge',
    emoji: '📚',
    difficulty: 'medium'
  },
  {
    id: 'family-connection',
    title: 'Family Bond',
    description: 'Spend quality time with family or call a relative',
    emoji: '👨‍👩‍👧‍👦',
    difficulty: 'easy'
  },
  {
    id: 'gratitude-practice',
    title: 'Practice Gratitude',
    description: 'Write down 3 things you\'re grateful for',
    emoji: '🙏',
    difficulty: 'easy'
  },
  {
    id: 'nature-reflection',
    title: 'Nature Reflection',
    description: 'Spend time in nature reflecting on Allah\'s creation',
    emoji: '🌿',
    difficulty: 'easy'
  },
  {
    id: 'fasting-practice',
    title: 'Optional Fasting',
    description: 'Fast today (like Monday/Thursday sunnah)',
    emoji: '🌙',
    difficulty: 'hard'
  },
  {
    id: 'digital-detox',
    title: 'Digital Detox',
    description: 'Stay away from social media for 3 hours',
    emoji: '📱',
    difficulty: 'medium'
  },
  {
    id: 'good-deed',
    title: 'Random Good Deed',
    description: 'Do a good deed for someone without expecting anything back',
    emoji: '✨',
    difficulty: 'medium'
  },
  {
    id: 'istighfar-session',
    title: 'Istighfar Session',
    description: 'Say "Astaghfirullah" 100 times with reflection',
    emoji: '🤍',
    difficulty: 'easy'
  },
  {
    id: 'healthy-eating',
    title: 'Mindful Eating',
    description: 'Eat only halal and nutritious food today',
    emoji: '🥗',
    difficulty: 'easy'
  },
  {
    id: 'self-control',
    title: 'Self-Control Challenge',
    description: 'Avoid one bad habit for the entire day',
    emoji: '🎯',
    difficulty: 'hard'
  }
];

export const useDailyChallenges = () => {
  const [currentChallenge, setCurrentChallenge] = useState(() => {
    // Get challenge based on day of year to ensure consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dailyChallenges[dayOfYear % dailyChallenges.length];
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'hard':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'hard':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return {
    currentChallenge,
    allChallenges: dailyChallenges,
    getDifficultyColor,
    getDifficultyBadge,
  };
};