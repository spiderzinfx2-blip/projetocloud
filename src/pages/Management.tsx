import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Briefcase, DollarSign, FileText, BookOpen, Kanban, Plus, Edit2, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth, UserData, saveUserData, loadUserData, Cliente, Servico, Trabalho } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { cn } from '@/lib/utils';

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, gradient }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  gradient: string;
}) => (
  <div className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-shadow">
    <div className="flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", gradient)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

// Resumo Tab
const ResumoTab = ({ trabalhos, clientes, servicos }: { 
  trabalhos: Trabalho[]; 
  clientes: Cliente[]; 
  servicos: Servico[];
}) => {
  const totalRecebido = trabalhos.reduce((sum, t) => {
    if (t.status === 'recebido') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={Users} 
        label="Total de Clientes" 
        value={clientes.length}
        gradient="from-blue-500 to-cyan-500"
      />
      <StatCard 
        icon={Briefcase} 
        label="Serviços Cadastrados" 
        value={servicos.length}
        gradient="from-violet-500 to-purple-500"
      />
      <StatCard 
        icon={FileText} 
        label="Trabalhos Realizados" 
        value={trabalhos.length}
        gradient="from-emerald-500 to-teal-500"
      />
      <StatCard 
        icon={DollarSign} 
        label="Total Recebido" 
        value={`R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        gradient="from-amber-500 to-orange-500"
      />
    </div>
  );
};

// Clientes Tab
const ClientesTab = ({ clientes }: { clientes: Cliente[] }) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Clientes</h3>
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Novo Cliente
      </Button>
    </div>
    
    {clientes.length > 0 ? (
      <div className="divide-y divide-border">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{cliente.nome}</p>
                <p className="text-sm text-muted-foreground">{cliente.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="p-12 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
      </div>
    )}
  </div>
);

// Serviços Tab
const ServicosTab = ({ servicos }: { servicos: Servico[] }) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Serviços</h3>
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Novo Serviço
      </Button>
    </div>
    
    {servicos.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {servicos.map((servico) => (
          <div key={servico.id} className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors">
            <p className="font-medium text-foreground mb-1">{servico.nome}</p>
            <p className="text-sm text-muted-foreground mb-3">{servico.descricao}</p>
            <p className="text-lg font-bold text-primary">
              R$ {servico.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <div className="p-12 text-center">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
      </div>
    )}
  </div>
);

// Trabalhos Tab
const TrabalhosTab = ({ trabalhos, clientes, servicos }: { 
  trabalhos: Trabalho[]; 
  clientes: Cliente[]; 
  servicos: Servico[];
}) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Trabalhos</h3>
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Novo Trabalho
      </Button>
    </div>
    
    {trabalhos.length > 0 ? (
      <div className="divide-y divide-border">
        {trabalhos.map((trabalho) => {
          const cliente = clientes.find((c) => c.id === trabalho.clienteId);
          const servico = servicos.find((s) => s.id === trabalho.servicoId);
          
          const statusStyles: Record<string, string> = {
            'recebido': 'bg-success/10 text-success',
            '50%': 'bg-warning/10 text-warning',
            'pendente': 'bg-info/10 text-info',
            'cancelado': 'bg-destructive/10 text-destructive'
          };

          return (
            <div key={trabalho.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium text-foreground">{servico?.nome || 'Serviço'}</p>
                <p className="text-sm text-muted-foreground">{cliente?.nome || 'Cliente'}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  statusStyles[trabalho.status] || 'bg-muted text-muted-foreground'
                )}>
                  {trabalho.status}
                </span>
                <p className="font-bold text-foreground">
                  R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Nenhum trabalho registrado</p>
      </div>
    )}
  </div>
);

// Faturamento Tab
const FaturamentoTab = ({ trabalhos }: { trabalhos: Trabalho[] }) => {
  const recebido = trabalhos.reduce((sum, t) => {
    if (t.status === 'recebido') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0);
  
  const pendente = trabalhos.reduce((sum, t) => {
    if (t.status === 'pendente') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Total Recebido</h3>
        </div>
        <p className="text-3xl font-bold text-success">
          R$ {recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Pendente</h3>
        </div>
        <p className="text-3xl font-bold text-warning">
          R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

// Placeholder Tab
const PlaceholderTab = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="bg-card rounded-xl border border-border p-12 text-center">
    <Icon className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">Em desenvolvimento...</p>
  </div>
);

// Main Component
export default function Management() {
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
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
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
    <AppLayout title="Gerenciamento" subtitle="Clientes, Serviços e Faturamento">
      {/* Tab Navigation */}
      <div className="mb-6 -mx-4 lg:-mx-6 px-4 lg:px-6 border-b border-border overflow-x-auto scrollbar-thin">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'resumo' && (
          <ResumoTab 
            trabalhos={userData.trabalhos || []} 
            clientes={userData.clientes || []} 
            servicos={userData.servicos || []} 
          />
        )}
        {activeTab === 'clientes' && <ClientesTab clientes={userData.clientes || []} />}
        {activeTab === 'servicos' && <ServicosTab servicos={userData.servicos || []} />}
        {activeTab === 'trabalhos' && (
          <TrabalhosTab 
            trabalhos={userData.trabalhos || []} 
            clientes={userData.clientes || []}
            servicos={userData.servicos || []}
          />
        )}
        {activeTab === 'faturamento' && <FaturamentoTab trabalhos={userData.trabalhos || []} />}
        {activeTab === 'notion' && <PlaceholderTab icon={BookOpen} title="Notas" />}
        {activeTab === 'trello' && <PlaceholderTab icon={Kanban} title="Kanban" />}
      </motion.div>
    </AppLayout>
  );
}
