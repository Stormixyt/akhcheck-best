import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Flame, Users, MessageCircle, Skull, Calendar, BookOpen, Palette, Settings } from "lucide-react";

export const UpdateLogDialog = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useUserData();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show dialog if user is logged in and hasn't seen v1.2 update
    if (user && preferences && !preferences.has_seen_v12_update) {
      setOpen(true);
    }
  }, [user, preferences]);

  const handleLockIn = async () => {
    if (preferences) {
      await updatePreferences({ has_seen_v12_update: true });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-card border-primary/20 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl modern-gradient animate-gradient flex items-center justify-center glow-primary">
            <Flame className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🚀 AkhCheck v1.2 – Power Update
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            New level of discipline and connection, akhi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-foreground">
              <Calendar className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">🔔 Daily notification system</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <Users className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">📢 Real group notifications</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <Palette className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">🌙 Light & Dark theme toggle</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">🎯 Custom group goals</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <BookOpen className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">🚀 More daily challenges</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <Settings className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">🌍 Translate button (EN/NL)</span>
            </div>
            <div className="flex items-center space-x-3 text-foreground">
              <Skull className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">🔧 Sync fixes & UI improvements</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleLockIn}
            className="w-full h-12 rounded-2xl text-base font-semibold modern-gradient animate-gradient glow-primary"
          >
            Let's Lock In 🔥
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};