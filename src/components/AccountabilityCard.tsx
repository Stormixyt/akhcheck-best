import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, XCircle, AlertTriangle, Lock, Unlock, 
  Eye, EyeOff, Target, Calendar, Shield, Users
} from "lucide-react";
import { QuranDialog } from "./QuranDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface AccountabilityGoal {
  id: string;
  title: string;
  description: string;
  target_days: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  is_public: boolean;
  current_progress: number;
}

interface AccountabilityCardProps {
  username: string;
  streak: number;
  todayStatus: "gooned" | "disciplined" | null;
  onStatusUpdate: (status: "gooned" | "disciplined") => void;
  isOwnProfile?: boolean;
}

export const AccountabilityCard = ({ 
  username, 
  streak, 
  todayStatus, 
  onStatusUpdate, 
  isOwnProfile = false 
}: AccountabilityCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"gooned" | "disciplined" | null>(null);
  const [showQuranDialog, setShowQuranDialog] = useState(false);
  const [isPublicAccountability, setIsPublicAccountability] = useState(false);
  const [accountabilityGoals, setAccountabilityGoals] = useState<AccountabilityGoal[]>([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_days: 30,
    is_public: false
  });

  useEffect(() => {
    if (user && isOwnProfile) {
      loadAccountabilitySettings();
      loadAccountabilityGoals();
    }
  }, [user, isOwnProfile]);

  const loadAccountabilitySettings = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('public_accountability')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setIsPublicAccountability(data.public_accountability || false);
      }
    } catch (error) {
      console.error('Error loading accountability settings:', error);
    }
  };

  const loadAccountabilityGoals = async () => {
    if (!user) return;
    
    try {
      // For now, use localStorage until we add the accountability_goals table
      const goalsData = localStorage.getItem(`accountability_goals_${user.id}`);
      if (goalsData) {
        setAccountabilityGoals(JSON.parse(goalsData));
      }
    } catch (error) {
      console.error('Error loading accountability goals:', error);
    }
  };

  const updatePublicAccountability = async (isPublic: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          public_accountability: isPublic
        });

      if (error) throw error;
      
      setIsPublicAccountability(isPublic);
      toast({
        title: isPublic ? t('public_accountability_enabled') : t('private_mode_enabled'),
        description: isPublic 
          ? t('stats_visible_members')
          : t('stats_now_private'),
      });
    } catch (error) {
      console.error('Error updating accountability settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const createAccountabilityGoal = async () => {
    if (!user || !newGoal.title.trim()) return;
    
    try {
      const goal: AccountabilityGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        target_days: newGoal.target_days,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + newGoal.target_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_locked: false,
        is_public: newGoal.is_public,
        current_progress: 0
      };

      const updatedGoals = [...accountabilityGoals, goal];
      localStorage.setItem(`accountability_goals_${user.id}`, JSON.stringify(updatedGoals));
      setAccountabilityGoals(updatedGoals);
      
      setNewGoal({ title: '', description: '', target_days: 30, is_public: false });
      setShowGoalDialog(false);
      
      toast({
        title: t('goal_created'),
        description: `Your ${newGoal.target_days}-day accountability goal is now active`,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const lockGoal = async (goalId: string) => {
    try {
      const updatedGoals = accountabilityGoals.map(goal => 
        goal.id === goalId ? { ...goal, is_locked: true } : goal
      );
      localStorage.setItem(`accountability_goals_${user.id}`, JSON.stringify(updatedGoals));
      setAccountabilityGoals(updatedGoals);
      
      toast({
        title: t('goal_locked'),
        description: t('cannot_modify_until_completion'),
      });
    } catch (error) {
      console.error('Error locking goal:', error);
    }
  };

  const handleStatusClick = (status: "gooned" | "disciplined") => {
    if (todayStatus !== null) {
      toast({
        title: t('already_checked_in'),
        description: "You've already recorded your status for today.",
        variant: "destructive",
      });
      return;
    }

    setSelectedStatus(status);
    setShowConfirmation(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedStatus) {
      onStatusUpdate(selectedStatus);
      
      // Update goal progress
      if (selectedStatus === 'disciplined' && accountabilityGoals.length > 0) {
        const updatedGoals = accountabilityGoals.map(goal => ({
          ...goal,
          current_progress: Math.min(goal.current_progress + 1, goal.target_days)
        }));
        localStorage.setItem(`accountability_goals_${user.id}`, JSON.stringify(updatedGoals));
        setAccountabilityGoals(updatedGoals);
      }
      
      if (selectedStatus === "gooned") {
        setShowQuranDialog(true);
      }
    }
    setShowConfirmation(false);
    setSelectedStatus(null);
  };

  const getStatusColor = () => {
    if (todayStatus === "disciplined") return "text-green-500";
    if (todayStatus === "gooned") return "text-red-500";
    return "text-muted-foreground";
  };

  const getStatusText = () => {
    if (todayStatus === "disciplined") return t('disciplined_today') + " ✅";
    if (todayStatus === "gooned") return t('struggled_today') + " 💀";
    return t('how_did_you_do');
  };

  const activeGoal = accountabilityGoals.find(goal => {
    const today = new Date().toISOString().split('T')[0];
    return today >= goal.start_date && today <= goal.end_date;
  });

  return (
    <>
      <GlassCard className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 hover-lift">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{username}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-primary">{streak}</span>
                  <span className="text-sm text-muted-foreground">{t('streak')}</span>
                </div>
                {isOwnProfile && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                    {isPublicAccountability ? (
                      <><Eye className="w-3 h-3 mr-1" /> {t('public')}</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> {t('private')}</>
                    )}
                  </Badge>
                )}
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex flex-col items-end space-y-2">
                <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3">
                      <Target className="w-4 h-4 mr-1" />
                      Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Accountability Goal</DialogTitle>
                      <DialogDescription>
                        Set a specific target to stay accountable to your discipline journey.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Goal Title</Label>
                        <Input
                          id="title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., 30 Days No PMO"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Why is this goal important to you?"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="days">Target Days</Label>
                        <Input
                          id="days"
                          type="number"
                          value={newGoal.target_days}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, target_days: parseInt(e.target.value) || 30 }))}
                          min={1}
                          max={365}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="public"
                          checked={newGoal.is_public}
                          onCheckedChange={(checked) => setNewGoal(prev => ({ ...prev, is_public: checked }))}
                        />
                        <Label htmlFor="public">Make this goal public</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createAccountabilityGoal}>Create Goal</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Active Goal Progress */}
          {activeGoal && isOwnProfile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{activeGoal.title}</span>
                  {activeGoal.is_locked && (
                    <Lock className="w-3 h-3 text-orange-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {activeGoal.current_progress}/{activeGoal.target_days} days
                </span>
              </div>
              <Progress 
                value={(activeGoal.current_progress / activeGoal.target_days) * 100} 
                className="h-2"
              />
              {!activeGoal.is_locked && activeGoal.current_progress >= 7 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => lockGoal(activeGoal.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Lock Goal
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Status Display */}
          <div className="text-center">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && todayStatus === null && (
            <div className="flex space-x-3">
              <Button
                onClick={() => handleStatusClick("disciplined")}
                className="flex-1 bg-success hover:bg-success/80 text-success-foreground transition-all duration-200 hover:scale-105"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('i_succeeded')}
              </Button>
              <Button
                onClick={() => handleStatusClick("gooned")}
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t('i_gooned')}
              </Button>
            </div>
          )}

          {/* Privacy Toggle for Own Profile */}
          {isOwnProfile && (
            <div className="pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('public_accountability')}</span>
                </div>
                <Switch
                  checked={isPublicAccountability}
                  onCheckedChange={updatePublicAccountability}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPublicAccountability 
                  ? t('progress_visible')
                  : t('progress_private')
                }
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="glass-card border-warning/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>{t('confirm_status')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus === "disciplined" 
                ? t('confirming_disciplined')
                : t('confirming_struggled')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStatus(null)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusUpdate}
              className={selectedStatus === "disciplined" 
                ? "bg-success hover:bg-success/80 text-success-foreground" 
                : "bg-destructive hover:bg-destructive/80"
              }
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quran Dialog for failed days */}
      <QuranDialog 
        open={showQuranDialog} 
        onOpenChange={setShowQuranDialog}
      />
    </>
  );
};
