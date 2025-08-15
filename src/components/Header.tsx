import { Bell, Settings, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TranslateButton, useTranslation } from "@/hooks/useTranslation";

interface HeaderProps {
  username: string;
}

export const Header = ({ username }: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('akhcheck')}</h1>
            <p className="text-sm text-muted-foreground">{t('as_salamu_alaykum')}, {username}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TranslateButton />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/groups")}
            title={t('groups')}
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/notifications")}
            title={t('notifications')}
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/settings")}
            title={t('settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};