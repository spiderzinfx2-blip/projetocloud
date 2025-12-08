import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { GlobalNotificationSound } from "@/components/GlobalNotificationSound";
import { useEffect, useState } from "react";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Management from "./pages/Management";
import Lumina from "./pages/Lumina";
import Patrocinio from "./pages/Patrocinio";
import Settings from "./pages/Settings";
import Financas from "./pages/Financas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper to get creator username for global notifications
function GlobalNotificationWrapper() {
  const { user } = useAuth();
  const [creatorUsername, setCreatorUsername] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem('creator-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setCreatorUsername(profile.username);
      }
    }
  }, [user]);

  return <GlobalNotificationSound username={creatorUsername} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalNotificationWrapper />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gerenciamento" element={<Management />} />
              <Route path="/cinefy" element={<Lumina />} />
              <Route path="/patrocinio" element={<Patrocinio />} />
              <Route path="/patrocinio/:username" element={<Patrocinio />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="/financas" element={<Financas />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
