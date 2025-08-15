import { useState } from 'react';

export interface GroupGoal {
  id: string;
  group_id: string;
  title: string;
  description: string;
  target_count: number;
  current_count: number;
  created_by: string;
  created_at: string;
  completed: boolean;
}

export const useGroupGoals = (groupId: string) => {
  const [goals, setGoals] = useState<GroupGoal[]>([
    {
      id: '1',
      group_id: groupId,
      title: 'Daily Prayers',
      description: 'Complete all 5 daily prayers',
      target_count: 35,
      current_count: 12,
      created_by: 'user1',
      created_at: new Date().toISOString(),
      completed: false,
    },
    {
      id: '2',
      group_id: groupId,
      title: 'Quran Reading',
      description: 'Read 1 page of Quran daily',
      target_count: 30,
      current_count: 8,
      created_by: 'user2',
      created_at: new Date().toISOString(),
      completed: false,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const createGoal = async (title: string, description: string, targetCount: number) => {
    const newGoal: GroupGoal = {
      id: Date.now().toString(),
      group_id: groupId,
      title,
      description,
      target_count: targetCount,
      current_count: 0,
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      completed: false,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoalProgress = async (goalId: string, increment: number = 1) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newCount = Math.max(0, g.current_count + increment);
          const isCompleted = newCount >= g.target_count;
          return { ...g, current_count: newCount, completed: isCompleted };
        }
        return g;
      })
    );
  };

  const refetch = async () => {
    // No-op for now
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoalProgress,
    refetch,
  };
};