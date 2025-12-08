import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Briefcase, DollarSign, FileText, BookOpen, Kanban, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth, UserData, saveUserData, loadUserData, Cliente, Servico, Trabalho } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { cn } from '@/lib/utils';
import { ClienteModal } from '@/components/management/ClienteModal';
import { ServicoModal } from '@/components/management/ServicoModal';
import { TrabalhoModal } from '@/components/management/TrabalhoModal';
import { NotasTab } from '@/components/management/NotasTab';
import { KanbanTab } from '@/components/management/KanbanTab';
import { ClienteDetails } from '@/components/management/ClienteDetails';
import { TrabalhoDetails } from '@/components/management/TrabalhoDetails';
import { FaturamentoTab } from '@/components/management/FaturamentoTab';
import { toast } from '@/hooks/use-toast';

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
const ClientesTab = ({ 
  clientes, 
  onAdd, 
  onEdit, 
  onDelete,
  onView
}: { 
  clientes: Cliente[];
  onAdd: () => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onView?: (cliente: Cliente) => void;
}) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Clientes</h3>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Cliente
      </Button>
    </div>
    
    {clientes.length > 0 ? (
      <div className="divide-y divide-border">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => onView?.(cliente)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground hover:text-primary transition-colors">{cliente.nome}</p>
                <p className="text-sm text-muted-foreground">{cliente.email || cliente.telefone || 'Sem contato'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(cliente)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cliente)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(cliente.id)}>
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
const ServicosTab = ({ 
  servicos, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  servicos: Servico[];
  onAdd: () => void;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Serviços</h3>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Serviço
      </Button>
    </div>
    
    {servicos.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {servicos.map((servico) => (
          <div key={servico.id} className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors group">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium text-foreground">{servico.nome}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(servico)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(servico.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{servico.descricao || 'Sem descrição'}</p>
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
const TrabalhosTab = ({ 
  trabalhos, 
  clientes, 
  servicos,
  onAdd,
  onEdit,
  onDelete
}: { 
  trabalhos: Trabalho[]; 
  clientes: Cliente[]; 
  servicos: Servico[];
  onAdd: () => void;
  onEdit: (trabalho: Trabalho) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Trabalhos</h3>
      <Button size="sm" onClick={onAdd}>
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
                <p className="font-medium text-foreground">{servico?.nome || trabalho.descricao || 'Serviço'}</p>
                <p className="text-sm text-muted-foreground">{cliente?.nome || 'Cliente'} • {new Date(trabalho.data).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  statusStyles[trabalho.status] || 'bg-muted text-muted-foreground'
                )}>
                  {trabalho.status}
                </span>
                <p className="font-bold text-foreground min-w-[100px] text-right">
                  R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(trabalho)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(trabalho.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

// Main Component
export default function Management() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumo');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Modal states
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [servicoModalOpen, setServicoModalOpen] = useState(false);
  const [trabalhoModalOpen, setTrabalhoModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [editingTrabalho, setEditingTrabalho] = useState<Trabalho | null>(null);
  const [clienteDetailsOpen, setClienteDetailsOpen] = useState(false);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [trabalhoDetailsOpen, setTrabalhoDetailsOpen] = useState(false);
  const [viewingTrabalho, setViewingTrabalho] = useState<Trabalho | null>(null);

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

  const updateUserData = (newData: UserData) => {
    if (!user) return;
    setUserData(newData);
    saveUserData(user.id, newData);
  };

  // Cliente handlers
  const handleSaveCliente = (cliente: Cliente) => {
    if (!userData) return;
    const exists = userData.clientes?.find(c => c.id === cliente.id);
    const newClientes = exists 
      ? userData.clientes?.map(c => c.id === cliente.id ? cliente : c)
      : [...(userData.clientes || []), cliente];
    updateUserData({ ...userData, clientes: newClientes });
    toast({ title: exists ? 'Cliente atualizado!' : 'Cliente criado!' });
  };

  const handleDeleteCliente = (id: string) => {
    if (!userData) return;
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      updateUserData({ ...userData, clientes: userData.clientes?.filter(c => c.id !== id) });
      toast({ title: 'Cliente excluído!' });
    }
  };

  // Serviço handlers
  const handleSaveServico = (servico: Servico) => {
    if (!userData) return;
    const exists = userData.servicos?.find(s => s.id === servico.id);
    const newServicos = exists 
      ? userData.servicos?.map(s => s.id === servico.id ? servico : s)
      : [...(userData.servicos || []), servico];
    updateUserData({ ...userData, servicos: newServicos });
    toast({ title: exists ? 'Serviço atualizado!' : 'Serviço criado!' });
  };

  const handleDeleteServico = (id: string) => {
    if (!userData) return;
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      updateUserData({ ...userData, servicos: userData.servicos?.filter(s => s.id !== id) });
      toast({ title: 'Serviço excluído!' });
    }
  };

  // Trabalho handlers
  const handleSaveTrabalho = (trabalho: Trabalho) => {
    if (!userData) return;
    const exists = userData.trabalhos?.find(t => t.id === trabalho.id);
    const newTrabalhos = exists 
      ? userData.trabalhos?.map(t => t.id === trabalho.id ? trabalho : t)
      : [...(userData.trabalhos || []), trabalho];
    updateUserData({ ...userData, trabalhos: newTrabalhos });
    toast({ title: exists ? 'Trabalho atualizado!' : 'Trabalho criado!' });
  };

  const handleDeleteTrabalho = (id: string) => {
    if (!userData) return;
    if (confirm('Tem certeza que deseja excluir este trabalho?')) {
      updateUserData({ ...userData, trabalhos: userData.trabalhos?.filter(t => t.id !== id) });
      toast({ title: 'Trabalho excluído!' });
    }
  };

  // Notas handlers
  const handleSaveNotas = (notas: any[]) => {
    if (!userData) return;
    updateUserData({ ...userData, notionPages: notas });
  };

  // Kanban handlers
  const handleSaveKanban = (columns: any[]) => {
    if (!userData) return;
    updateUserData({ ...userData, trelloBoards: columns });
  };

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
    { id: 'notas', label: 'Notas', icon: BookOpen },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
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
        {activeTab === 'clientes' && (
          <ClientesTab 
            clientes={userData.clientes || []}
            onAdd={() => { setEditingCliente(null); setClienteModalOpen(true); }}
            onEdit={(cliente) => { setEditingCliente(cliente); setClienteModalOpen(true); }}
            onDelete={handleDeleteCliente}
            onView={(cliente) => { setViewingCliente(cliente); setClienteDetailsOpen(true); }}
          />
        )}
        {activeTab === 'servicos' && (
          <ServicosTab 
            servicos={userData.servicos || []}
            onAdd={() => { setEditingServico(null); setServicoModalOpen(true); }}
            onEdit={(servico) => { setEditingServico(servico); setServicoModalOpen(true); }}
            onDelete={handleDeleteServico}
          />
        )}
        {activeTab === 'trabalhos' && (
          <TrabalhosTab 
            trabalhos={userData.trabalhos || []} 
            clientes={userData.clientes || []}
            servicos={userData.servicos || []}
            onAdd={() => { setEditingTrabalho(null); setTrabalhoModalOpen(true); }}
            onEdit={(trabalho) => { setEditingTrabalho(trabalho); setTrabalhoModalOpen(true); }}
            onDelete={handleDeleteTrabalho}
          />
        )}
        {activeTab === 'faturamento' && (
          <FaturamentoTab 
            trabalhos={userData.trabalhos || []} 
            clientes={userData.clientes || []}
            servicos={userData.servicos || []}
          />
        )}
        {activeTab === 'notas' && (
          <NotasTab 
            notas={userData.notionPages || []} 
            onSave={handleSaveNotas}
          />
        )}
        {activeTab === 'kanban' && (
          <KanbanTab 
            columns={userData.trelloBoards || []} 
            onSave={handleSaveKanban}
          />
        )}
      </motion.div>

      {/* Modals */}
      <ClienteModal
        open={clienteModalOpen}
        onOpenChange={setClienteModalOpen}
        cliente={editingCliente}
        onSave={handleSaveCliente}
      />
      <ServicoModal
        open={servicoModalOpen}
        onOpenChange={setServicoModalOpen}
        servico={editingServico}
        categorias={userData.categorias || []}
        onSave={handleSaveServico}
      />
      <TrabalhoModal
        open={trabalhoModalOpen}
        onOpenChange={setTrabalhoModalOpen}
        trabalho={editingTrabalho}
        clientes={userData.clientes || []}
        servicos={userData.servicos || []}
        onSave={handleSaveTrabalho}
      />
      <ClienteDetails
        open={clienteDetailsOpen}
        onOpenChange={setClienteDetailsOpen}
        cliente={viewingCliente}
        trabalhos={userData.trabalhos || []}
        servicos={userData.servicos || []}
        onEdit={(cliente) => { 
          setClienteDetailsOpen(false);
          setEditingCliente(cliente); 
          setClienteModalOpen(true); 
        }}
        onViewTrabalho={(trabalho) => {
          setClienteDetailsOpen(false);
          setViewingTrabalho(trabalho);
          setTrabalhoDetailsOpen(true);
        }}
      />
      <TrabalhoDetails
        open={trabalhoDetailsOpen}
        onOpenChange={setTrabalhoDetailsOpen}
        trabalho={viewingTrabalho}
        cliente={userData.clientes?.find(c => c.id === viewingTrabalho?.clienteId) || null}
        servicos={userData.servicos || []}
        onSave={handleSaveTrabalho}
        onDelete={handleDeleteTrabalho}
      />
    </AppLayout>
  );
}
