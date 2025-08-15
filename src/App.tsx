import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Settings } from "./pages/Settings";
import { EnhancedSettings } from "./pages/EnhancedSettings";
import { Notifications } from "./pages/Notifications";
import { Auth } from "./pages/Auth";
import { AuthChoice } from "./pages/AuthChoice";
import { Onboarding } from "./pages/Onboarding";
import { EditProfile } from "./pages/EditProfile";
import { Groups } from "./pages/Groups";
import { GroupDetail } from "./pages/GroupDetail";
import { AuthProvider } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { TranslationProvider } from "./hooks/useTranslation";
import { PremiumProvider } from "./hooks/usePremium";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  useTheme(); // Apply theme colors
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<EnhancedSettings />} />
          <Route path="/settings-old" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/auth-choice" element={<AuthChoice />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PremiumProvider>
        <TranslationProvider>
          <AppContent />
        </TranslationProvider>
      </PremiumProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
