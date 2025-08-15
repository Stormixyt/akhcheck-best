import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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

interface StatusCardProps {
  username: string;
  streak: number;
  todayStatus: "gooned" | "disciplined" | null;
  onStatusUpdate: (status: "gooned" | "disciplined") => void;
  isOwnProfile?: boolean;
}

export const StatusCard = ({ 
  username, 
  streak, 
  todayStatus, 
  onStatusUpdate, 
  isOwnProfile = false 
}: StatusCardProps) => {
  const [showQuranDialog, setShowQuranDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"gooned" | "disciplined" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"gooned" | "disciplined" | null>(null);

  // Check if warning has been shown before
  const hasSeenWarning = localStorage.getItem('akhcheck-warning-seen') === 'true';
  const repeatWarnings = localStorage.getItem('akhcheck-repeat-warnings') === 'true';

  const handleStatusClick = (status: "gooned" | "disciplined") => {
    if (!isOwnProfile) return;
    
    // Show warning for "gooned" status if not seen before or if repeat warnings is enabled
    if (status === "gooned" && (!hasSeenWarning || repeatWarnings)) {
      setPendingStatus(status);
      setShowWarning(true);
      return;
    }
    
    // Proceed with status update
    proceedWithStatusUpdate(status);
  };

  const proceedWithStatusUpdate = (status: "gooned" | "disciplined") => {
    setSelectedStatus(status);
    setShowQuranDialog(true);
    onStatusUpdate(status);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleWarningProceed = () => {
    // Mark warning as seen
    localStorage.setItem('akhcheck-warning-seen', 'true');
    
    setShowWarning(false);
    if (pendingStatus) {
      proceedWithStatusUpdate(pendingStatus);
      setPendingStatus(null);
    }
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setPendingStatus(null);
  };

  const getStatusIcon = () => {
    if (todayStatus === "disciplined") {
      return <CheckCircle className="w-8 h-8 text-success" />;
    } else if (todayStatus === "gooned") {
      return <XCircle className="w-8 h-8 text-destructive" />;
    }
    return null;
  };

  return (
    <>
      <GlassCard className={`p-6 transition-all duration-300 ${isAnimating ? 'confetti-animation' : ''}`}>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <h3 className="text-xl font-semibold text-foreground">{username}</h3>
            {getStatusIcon()}
          </div>
          
          <div className="text-3xl font-bold text-primary">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </div>

          {isOwnProfile && !todayStatus && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">How did you do today?</p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleStatusClick("disciplined")}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground glow-success px-2 text-xs min-w-0 relative z-10"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">I Succeeded</span>
                </Button>
                <Button
                  onClick={() => handleStatusClick("gooned")}
                  className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 px-2 text-xs min-w-0 relative z-10"
                  variant="outline"
                  size="lg"
                >
                  <XCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">I gooned</span>
                </Button>
              </div>
            </div>
          )}

          {isOwnProfile && todayStatus && (
            <div className="text-sm text-muted-foreground">
              Status updated for today!
            </div>
          )}
        </div>
      </GlassCard>

      <QuranDialog
        open={showQuranDialog}
        onOpenChange={setShowQuranDialog}
        status={selectedStatus}
      />

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="glass-card border-warning/20">
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <AlertDialogTitle className="text-foreground">Bro… even serieus.</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground text-left space-y-3">
              <p>Wat je hier indrukt, wordt zichtbaar voor je groep. Deel geen specifieke zonden. De Profeet ﷺ zei:</p>
              <p className="italic bg-accent/20 p-3 rounded-lg border-l-4 border-warning">
                "Iedereen uit mijn ummah zal worden vergeven, behalve degenen die hun zonden openlijk bekennen."
              </p>
              <p className="text-xs text-muted-foreground">— Sahih al-Bukhari, 6069</p>
              <p className="font-medium">🧠 Reflecteer, deel nooit in detail. Allah bedekt – respecteer dat.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
            <AlertDialogCancel onClick={handleWarningCancel}>
              Annuleer
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningProceed} className="bg-warning hover:bg-warning/90 text-warning-foreground">
              Ik begrijp het
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};