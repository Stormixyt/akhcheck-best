import { ReactNode } from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePremium } from '@/hooks/usePremium';
import { PremiumBadge } from './PremiumBadge';
import { useToast } from '@/hooks/use-toast';

interface PremiumFeatureGateProps {
  feature: string;
  featureName: string;
  description: string;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export const PremiumFeatureGate = ({ 
  feature, 
  featureName, 
  description, 
  children, 
  fallback,
  className = ''
}: PremiumFeatureGateProps) => {
  const { isPremium, hasFeature, activatePremium } = usePremium();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      await activatePremium();
      toast({
        title: "Welcome to Premium! 🎉",
        description: "All premium features are now unlocked",
      });
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // If user has access to this feature, render children
  if (isPremium && hasFeature(feature as any)) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead of the upgrade card
  if (fallback) {
    return <>{fallback}</>;
  }

  // Render upgrade prompt
  return (
    <Card className={`glass-card border-dashed border-primary/30 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full">
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {featureName}
          <PremiumBadge variant="crown" />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Premium Feature</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Unlock this feature and many more with AkhCheck Premium
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          <p className="text-xs text-muted-foreground">
            30-day money-back guarantee
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
