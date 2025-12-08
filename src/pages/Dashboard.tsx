import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Clapperboard, BarChart3, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'management',
      title: 'Gerenciamento',
      description: 'Clientes, Serviços, Trabalhos e Faturamento',
      icon: Settings,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      path: '/gerenciamento',
      available: true
    },
    {
      id: 'cinefy',
      title: 'Lumina Creators',
      description: 'Ferramentas para criadores de conteúdo da plataforma Lumina',
      icon: Clapperboard,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
      path: '/cinefy',
      available: true
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Relatórios e análises detalhadas do seu negócio',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      path: '/analytics',
      available: false
    },
    {
      id: 'automation',
      title: 'Automação',
      description: 'Workflows e processos automatizados inteligentes',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
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
    <AppLayout title="Dashboard" subtitle="Bem-vindo ao seu painel de controle">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 lg:p-10">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/20 text-sm font-medium text-primary-foreground">
                Versão 2.0
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-3">
              Ferramentas Disponíveis
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              Escolha uma das ferramentas abaixo para começar a gerenciar seu negócio de forma eficiente.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const isAvailable = tool.available;
          
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                onClick={() => handleToolClick(tool)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300",
                  isAvailable 
                    ? "cursor-pointer hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30" 
                    : "cursor-not-allowed opacity-60"
                )}
              >
                {/* Background gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                  tool.bgGradient,
                  isAvailable && "group-hover:opacity-100"
                )} />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      tool.gradient
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      isAvailable 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    )}>
                      {isAvailable ? "Disponível" : "Em Breve"}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  
                  {/* Action */}
                  <Button
                    variant={isAvailable ? "default" : "secondary"}
                    className="w-full"
                    disabled={!isAvailable}
                  >
                    {isAvailable ? (
                      <>
                        Acessar
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      "Em Desenvolvimento"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mt-12"
      >
        <p className="text-muted-foreground text-sm">
          Sistema de Gerenciamento Integrado — Versão 2.0
        </p>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
