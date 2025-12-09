import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Clapperboard, BarChart3, Zap, ArrowRight, Sparkles, TrendingUp, Users, FolderOpen } from 'lucide-react';
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
      path: '/gerenciamento',
      available: true,
      stats: { label: 'Clientes ativos', value: '12' }
    },
    {
      id: 'cinefy',
      title: 'Lumina Creators',
      description: 'Ferramentas para criadores de conteúdo da plataforma Lumina',
      icon: Clapperboard,
      gradient: 'from-violet-500 to-purple-500',
      path: '/cinefy',
      available: true,
      stats: { label: 'Conteúdos', value: '48' }
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Relatórios e análises detalhadas do seu negócio',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-teal-500',
      path: '/analytics',
      available: false,
      stats: null
    },
    {
      id: 'automation',
      title: 'Automação',
      description: 'Workflows e processos automatizados inteligentes',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
      path: '/automacao',
      available: false,
      stats: null
    }
  ];

  const quickStats = [
    { icon: Users, label: 'Clientes', value: '24', change: '+3 este mês', positive: true },
    { icon: FolderOpen, label: 'Projetos', value: '18', change: '+5 este mês', positive: true },
    { icon: TrendingUp, label: 'Receita', value: 'R$ 12.4k', change: '+12%', positive: true },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.available) {
      navigate(tool.path);
    }
  };

  return (
    <AppLayout title="Dashboard" subtitle="Bem-vindo ao seu painel de controle">
      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                stat.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-info p-8 lg:p-12">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-info/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                    Ferramentas Disponíveis
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-primary-foreground/20 text-xs font-semibold text-primary-foreground">
                    v2.0
                  </span>
                </div>
                <p className="text-primary-foreground/80 max-w-lg">
                  Escolha uma das ferramentas abaixo para gerenciar seu negócio de forma eficiente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const isAvailable = tool.available;
          
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div 
                onClick={() => handleToolClick(tool)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                  isAvailable 
                    ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 border-border hover:border-primary/30" 
                    : "cursor-not-allowed opacity-60 border-border"
                )}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                      tool.gradient
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold",
                      isAvailable 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isAvailable ? "Disponível" : "Em Breve"}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  
                  {/* Stats or Action */}
                  <div className="flex items-center justify-between">
                    {tool.stats && isAvailable ? (
                      <div>
                        <p className="text-2xl font-bold text-foreground">{tool.stats.value}</p>
                        <p className="text-sm text-muted-foreground">{tool.stats.label}</p>
                      </div>
                    ) : (
                      <div />
                    )}
                    
                    <Button
                      variant={isAvailable ? "default" : "secondary"}
                      size="lg"
                      disabled={!isAvailable}
                      className="rounded-xl"
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
                
                {/* Hover gradient overlay */}
                {isAvailable && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none",
                    tool.gradient
                  )} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
