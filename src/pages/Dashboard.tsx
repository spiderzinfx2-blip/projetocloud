import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings, Clapperboard, BarChart3, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tools = [
    {
      id: 'management',
      title: 'Gerenciamento',
      description: 'Clientes, Serviços, Trabalhos e Faturamento',
      icon: Settings,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      hoverColor: 'hover:border-blue-500/50',
      iconColor: 'text-blue-500',
      path: '/gerenciamento',
      available: true
    },
    {
      id: 'cinefy',
      title: 'Lumina Creators',
      description: 'Ferramentas para criadores de conteúdo da plataforma Lumina',
      icon: Clapperboard,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      hoverColor: 'hover:border-purple-500/50',
      iconColor: 'text-purple-500',
      path: '/cinefy',
      available: true
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Relatórios e análises detalhadas',
      icon: BarChart3,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:border-green-500/50',
      iconColor: 'text-green-500',
      path: '/analytics',
      available: false
    },
    {
      id: 'automation',
      title: 'Automação',
      description: 'Workflows e processos automatizados',
      icon: Zap,
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      hoverColor: 'hover:border-yellow-500/50',
      iconColor: 'text-yellow-500',
      path: '/automacao',
      available: false
    }
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.available) {
      navigate(tool.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center p-6 border-b border-border/50 backdrop-blur-sm bg-background/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Bem-vindo!</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'Usuário'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
          </GlassButton>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Title Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Ferramentas Disponíveis
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha uma das ferramentas abaixo para começar
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isAvailable = tool.available;
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}
              >
                <GlassCard 
                  className={cn(
                    "p-8 transition-all duration-300 group bg-gradient-to-br",
                    tool.color,
                    tool.borderColor,
                    isAvailable ? [
                      "cursor-pointer",
                      tool.hoverColor,
                      "hover:scale-[1.02] hover:shadow-xl"
                    ] : [
                      "cursor-not-allowed opacity-60"
                    ]
                  )}
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className={cn(
                        "p-4 rounded-full bg-background/50 backdrop-blur-sm border border-border/30 transition-transform duration-300",
                        isAvailable && "group-hover:scale-110"
                      )}>
                        <Icon className={cn("h-12 w-12", tool.iconColor)} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h2 className={cn(
                        "text-2xl font-bold transition-colors duration-300 text-foreground",
                        isAvailable && "group-hover:text-primary"
                      )}>
                        {tool.title}
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        isAvailable 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                      )}>
                        {isAvailable ? "Disponível" : "Em Breve"}
                      </span>
                    </div>
                    
                    {/* Button */}
                    <div className="pt-4">
                      <GlassButton
                        variant={isAvailable ? "default" : "outline"}
                        size="lg"
                        className={cn(
                          "w-full transition-all duration-300",
                          !isAvailable && "cursor-not-allowed"
                        )}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? `Acessar ${tool.title}` : "Em Desenvolvimento"}
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-muted-foreground text-sm">
            Sistema de Gerenciamento Integrado - Versão 2.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
