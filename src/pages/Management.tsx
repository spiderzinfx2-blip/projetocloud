import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Users, Briefcase, DollarSign, FileText, Settings, Kanban, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserData, saveUserData, loadUserData, Cliente, Servico, Trabalho, Categoria, ConfigEmpresa } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { LoginPage } from '@/components/auth/LoginPage';

// Placeholder pages - these would be full implementations
const ResumoTab = ({ trabalhos, clientes, servicos }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total de Clientes</p>
          <p className="text-2xl font-bold">{clientes?.length || 0}</p>
        </div>
      </div>
    </GlassCard>
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Briefcase className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Serviços Cadastrados</p>
          <p className="text-2xl font-bold">{servicos?.length || 0}</p>
        </div>
      </div>
    </GlassCard>
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <FileText className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Trabalhos Realizados</p>
          <p className="text-2xl font-bold">{trabalhos?.length || 0}</p>
        </div>
      </div>
    </GlassCard>
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-yellow-500/10">
          <DollarSign className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Recebido</p>
          <p className="text-2xl font-bold">
            R$ {(trabalhos?.reduce((sum: number, t: Trabalho) => {
              if (t.status === 'recebido') return sum + t.valor;
              if (t.status === '50%') return sum + (t.valor * 0.5);
              return sum;
            }, 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </GlassCard>
  </div>
);

const ClientesTab = ({ clientes, onAdd, onUpdate, onDelete }: any) => (
  <GlassCard className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold">Clientes</h3>
      <GlassButton size="sm">+ Novo Cliente</GlassButton>
    </div>
    {clientes?.length > 0 ? (
      <div className="space-y-3">
        {clientes.map((cliente: Cliente) => (
          <div key={cliente.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
            <div>
              <p className="font-medium">{cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{cliente.email}</p>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm">Editar</GlassButton>
              <GlassButton variant="ghost" size="sm" className="text-destructive">Excluir</GlassButton>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado</p>
    )}
  </GlassCard>
);

const ServicosTab = ({ servicos }: any) => (
  <GlassCard className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold">Serviços</h3>
      <GlassButton size="sm">+ Novo Serviço</GlassButton>
    </div>
    {servicos?.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicos.map((servico: Servico) => (
          <div key={servico.id} className="p-4 rounded-lg bg-background/50 border border-border/50">
            <p className="font-medium">{servico.nome}</p>
            <p className="text-sm text-muted-foreground">{servico.descricao}</p>
            <p className="text-lg font-bold text-primary mt-2">R$ {servico.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-muted-foreground py-8">Nenhum serviço cadastrado</p>
    )}
  </GlassCard>
);

const TrabalhosTab = ({ trabalhos, clientes, servicos }: any) => (
  <GlassCard className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold">Trabalhos</h3>
      <GlassButton size="sm">+ Novo Trabalho</GlassButton>
    </div>
    {trabalhos?.length > 0 ? (
      <div className="space-y-3">
        {trabalhos.map((trabalho: Trabalho) => {
          const cliente = clientes?.find((c: Cliente) => c.id === trabalho.clienteId);
          const servico = servicos?.find((s: Servico) => s.id === trabalho.servicoId);
          return (
            <div key={trabalho.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
              <div>
                <p className="font-medium">{servico?.nome || 'Serviço'}</p>
                <p className="text-sm text-muted-foreground">{cliente?.nome || 'Cliente'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trabalho.status === 'recebido' ? 'bg-green-500/10 text-green-500' :
                  trabalho.status === '50%' ? 'bg-yellow-500/10 text-yellow-500' :
                  trabalho.status === 'pendente' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {trabalho.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-center text-muted-foreground py-8">Nenhum trabalho registrado</p>
    )}
  </GlassCard>
);

const FaturamentoTab = ({ trabalhos }: any) => {
  const recebido = trabalhos?.reduce((sum: number, t: Trabalho) => {
    if (t.status === 'recebido') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0) || 0;
  
  const pendente = trabalhos?.reduce((sum: number, t: Trabalho) => {
    if (t.status === 'pendente') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-500">Total Recebido</h3>
          <p className="text-3xl font-bold">R$ {recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-500">Pendente</h3>
          <p className="text-3xl font-bold">R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default function Management() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumo');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (user) {
      const saved = loadUserData(user.id);
      if (saved) {
        setUserData(saved);
      } else {
        const defaultData: UserData = {
          id: user.id,
          name: user.name,
          email: user.email,
          theme: 'dark',
          clientes: [],
          servicos: [],
          trabalhos: [],
          categorias: [
            { id: 'cat1', nome: 'Edição de Vídeo', cor: '#6EE7B7' },
            { id: 'cat2', nome: 'Design Gráfico', cor: '#60A5FA' },
            { id: 'cat3', nome: 'Fotografia', cor: '#D97706' }
          ],
          empresaConfig: { nome: '', cnpj: '', banner: '', avatar: '' },
          notionPages: [],
          trelloBoards: []
        };
        setUserData(defaultData);
        saveUserData(user.id, defaultData);
      }
    }
  }, [user?.id]);

  if (!user) {
    return <LoginPage />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: BarChart3 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Briefcase },
    { id: 'trabalhos', label: 'Trabalhos', icon: FileText },
    { id: 'faturamento', label: 'Faturamento', icon: DollarSign },
    { id: 'notion', label: 'Notas', icon: BookOpen },
    { id: 'trello', label: 'Kanban', icon: Kanban },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassButton 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </GlassButton>
              <div>
                <h1 className="text-xl font-bold">Gerenciamento</h1>
                <p className="text-sm text-muted-foreground">Clientes, Serviços e Faturamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <GlassButton variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'resumo' && (
            <ResumoTab 
              trabalhos={userData.trabalhos} 
              clientes={userData.clientes} 
              servicos={userData.servicos} 
            />
          )}
          {activeTab === 'clientes' && (
            <ClientesTab clientes={userData.clientes} />
          )}
          {activeTab === 'servicos' && (
            <ServicosTab servicos={userData.servicos} />
          )}
          {activeTab === 'trabalhos' && (
            <TrabalhosTab 
              trabalhos={userData.trabalhos} 
              clientes={userData.clientes}
              servicos={userData.servicos}
            />
          )}
          {activeTab === 'faturamento' && (
            <FaturamentoTab trabalhos={userData.trabalhos} />
          )}
          {activeTab === 'notion' && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Notas</h3>
              <p className="text-muted-foreground">Área de notas estilo Notion em desenvolvimento...</p>
            </GlassCard>
          )}
          {activeTab === 'trello' && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Kanban</h3>
              <p className="text-muted-foreground">Quadro Kanban estilo Trello em desenvolvimento...</p>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
