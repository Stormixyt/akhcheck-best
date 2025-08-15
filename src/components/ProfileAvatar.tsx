import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  displayName: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onAvatarUpdate?: (url: string) => void;
}

export const ProfileAvatar = ({ 
  avatarUrl, 
  displayName, 
  size = "md", 
  editable = false,
  onAvatarUpdate
}: ProfileAvatarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate?.(publicUrl);
      
      toast({
        title: "Profile photo updated!",
        description: "Your new avatar has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!editable) {
    return (
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <div className="absolute -bottom-2 -right-2">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-background border-border"
            disabled={uploading}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleAvatarUpload(file);
              };
              input.click();
            }}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};