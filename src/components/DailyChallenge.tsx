import { useState, useEffect } from "react";
import { Target, CheckCircle, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";

export const DailyChallenge = () => {
  const { currentChallenge, getDifficultyBadge } = useDailyChallenges();
  const [completed, setCompleted] = useState(false);

  // Check if today's challenge is completed (from localStorage)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const challengeKey = `challenge-${currentChallenge.id}-${today}`;
    const isCompleted = localStorage.getItem(challengeKey) === 'true';
    setCompleted(isCompleted);
  }, [currentChallenge.id]);

  const handleComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const challengeKey = `challenge-${currentChallenge.id}-${today}`;
    localStorage.setItem(challengeKey, 'true');
    setCompleted(true);
  };

  return (
    <GlassCard className="p-6 hover-lift animate-smooth">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Today's Challenge</h3>
          </div>
          <Badge className={getDifficultyBadge(currentChallenge.difficulty)}>
            {currentChallenge.difficulty}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentChallenge.emoji}</span>
            <div>
              <h4 className="font-medium text-foreground">{currentChallenge.title}</h4>
              <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
            </div>
          </div>
          
          {!completed ? (
            <Button 
              onClick={handleComplete}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Clock className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          ) : (
            <Button 
              disabled 
              className="w-full bg-success/20 text-success hover:bg-success/20"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed! 🎉
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};