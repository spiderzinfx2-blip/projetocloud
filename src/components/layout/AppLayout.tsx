import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Settings, Clapperboard, Heart, 
  Menu, X, LogOut, Sparkles, Settings2, Wallet,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Gerenciamento', href: '/gerenciamento', icon: Settings },
  { name: 'Lumina Creators', href: '/cinefy', icon: Clapperboard },
  { name: 'Patrocínios', href: '/patrocinio', icon: Heart },
  { name: 'Finanças', href: '/financas', icon: Wallet },
  { name: 'Configurações', href: '/configuracoes', icon: Settings2 },
];

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-info/[0.02] pointer-events-none" />
      
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card/95 backdrop-blur-xl border-r border-border transition-all duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-border">
            <div className={cn(
              "flex items-center gap-3 transition-opacity",
              sidebarCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"
            )}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground tracking-tight">Lumina</h1>
                <p className="text-xs text-muted-foreground">Plataforma Criativa</p>
              </div>
            </div>
            
            {/* Collapse button - Desktop only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex h-8 w-8 rounded-lg"
            >
              <ChevronLeft className={cn(
                "w-4 h-4 transition-transform",
                sidebarCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            <p className={cn(
              "px-3 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity",
              sidebarCollapsed && "lg:opacity-0"
            )}>
              Menu Principal
            </p>
            
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    !isActive && "group-hover:scale-110 transition-transform"
                  )} />
                  <span className={cn(
                    "transition-opacity",
                    sidebarCollapsed && "lg:opacity-0 lg:w-0"
                  )}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-muted/50 transition-all",
              sidebarCollapsed && "lg:justify-center lg:p-2"
            )}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className={cn(
                "flex-1 min-w-0 transition-opacity",
                sidebarCollapsed && "lg:hidden"
              )}>
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className={cn(
                  "h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                  sidebarCollapsed && "lg:hidden"
                )}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-6 lg:px-8 h-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-10 w-10 rounded-xl"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {title && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* User avatar - visible on mobile */}
              <div className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile close button */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed top-5 right-5 z-50 lg:hidden w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center shadow-xl"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
