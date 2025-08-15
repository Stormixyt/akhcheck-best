import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PremiumBadgeProps {
  variant?: 'default' | 'crown' | 'sparkles';
  className?: string;
}

export const PremiumBadge = ({ variant = 'default', className = '' }: PremiumBadgeProps) => {
  if (variant === 'crown') {
    return (
      <Badge variant="secondary" className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 border-yellow-500/30 ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    );
  }
  
  if (variant === 'sparkles') {
    return (
      <Badge variant="secondary" className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30 ${className}`}>
        <Sparkles className="w-3 h-3 mr-1" />
        Pro
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={`bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 ${className}`}>
      Premium
    </Badge>
  );
};
