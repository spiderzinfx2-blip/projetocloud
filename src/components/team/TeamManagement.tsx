import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Trash2, Settings, Check, X, 
  Mail, Crown, Share2, Save, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTeam } from '@/hooks/useTeam';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AVAILABLE_TABS = [
  { id: 'lumina', label: 'Lumina Creators', description: 'Organizador de conteúdo e pedidos' },
  { id: 'gerenciamento', label: 'Gerenciamento', description: 'Clientes, serviços e trabalhos' },
  { id: 'patrocinio', label: 'Patrocínio', description: 'Página de patrocínio pública' },
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e estatísticas' },
];

export function TeamManagement() {
  const { 
    myTeam, 
    createTeam, 
    addMember, 
    removeMember, 
    updateSharedTabs,
    updateTeamName,
    deleteTeam 
  } = useTeam();
  
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [teamNameEdit, setTeamNameEdit] = useState('');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);

  // Initialize selected tabs when team loads
  React.useEffect(() => {
    if (myTeam) {
      setSelectedTabs(myTeam.sharedTabs);
      setTeamNameEdit(myTeam.name);
    }
  }, [myTeam]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast({ title: 'Digite um nome para a equipe', variant: 'destructive' });
      return;
    }
    
    const team = createTeam(newTeamName.trim());
    if (team) {
      toast({ title: 'Equipe criada com sucesso!' });
      setNewTeamName('');
    } else {
      toast({ title: 'Você já possui uma equipe', variant: 'destructive' });
    }
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      toast({ title: 'Digite o email do membro', variant: 'destructive' });
      return;
    }
    
    const success = addMember(newMemberEmail.trim(), newMemberName.trim() || undefined);
    if (success) {
      toast({ title: 'Membro adicionado com sucesso!' });
      setNewMemberEmail('');
      setNewMemberName('');
    } else {
      toast({ title: 'Este email já está na equipe', variant: 'destructive' });
    }
  };

  const handleRemoveMember = (memberId: string, memberName?: string) => {
    if (confirm(`Tem certeza que deseja remover ${memberName || 'este membro'}?`)) {
      const success = removeMember(memberId);
      if (success) {
        toast({ title: 'Membro removido com sucesso!' });
      }
    }
  };

  const handleToggleTab = (tabId: string) => {
    setSelectedTabs(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(t => t !== tabId);
      }
      return [...prev, tabId];
    });
  };

  const handleSaveTabs = () => {
    const success = updateSharedTabs(selectedTabs);
    if (success) {
      toast({ title: 'Abas compartilhadas atualizadas!' });
    }
  };

  const handleSaveTeamName = () => {
    if (!teamNameEdit.trim()) {
      toast({ title: 'Digite um nome para a equipe', variant: 'destructive' });
      return;
    }
    
    const success = updateTeamName(teamNameEdit.trim());
    if (success) {
      toast({ title: 'Nome da equipe atualizado!' });
      setEditingName(false);
    }
  };

  const handleDeleteTeam = () => {
    if (confirm('Tem certeza que deseja excluir a equipe? Todos os membros perderão acesso.')) {
      const success = deleteTeam();
      if (success) {
        toast({ title: 'Equipe excluída com sucesso!' });
      }
    }
  };

  // No team yet - show create form
  if (!myTeam) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Gestão de Equipe</h3>
            <p className="text-sm text-muted-foreground">Crie uma equipe para compartilhar abas com colaboradores</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Com uma equipe, você pode convidar pessoas para acessar abas específicas do seu perfil. 
              Os convidados não precisam de assinatura - apenas o dono da equipe.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome da Equipe</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Ex: Minha Produtora"
                />
              </div>
              
              <Button onClick={handleCreateTeam} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Criar Equipe
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has team - show management
  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={teamNameEdit}
                  onChange={(e) => setTeamNameEdit(e.target.value)}
                  className="w-48"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveTeamName}>
                  <Check className="w-4 h-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingName(false)}>
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {myTeam.name}
                  <button 
                    onClick={() => setEditingName(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {myTeam.members.length} {myTeam.members.length === 1 ? 'membro' : 'membros'}
                </p>
              </div>
            )}
          </div>
          
          <Button variant="destructive" size="sm" onClick={handleDeleteTeam}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Equipe
          </Button>
        </div>
      </div>

      {/* Shared Tabs */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Abas Compartilhadas</h4>
            <p className="text-sm text-muted-foreground">
              Selecione quais abas serão visíveis para os membros da equipe
            </p>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {AVAILABLE_TABS.map((tab) => (
            <label
              key={tab.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                selectedTabs.includes(tab.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <Checkbox
                checked={selectedTabs.includes(tab.id)}
                onCheckedChange={() => handleToggleTab(tab.id)}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{tab.label}</p>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
              </div>
            </label>
          ))}
        </div>
        
        <Button onClick={handleSaveTabs} disabled={JSON.stringify(selectedTabs) === JSON.stringify(myTeam.sharedTabs)}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      {/* Members */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Membros da Equipe</h4>
            <p className="text-sm text-muted-foreground">
              Adicione colaboradores pelo email
            </p>
          </div>
        </div>
        
        {/* Add Member Form */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Email do membro"
            type="email"
            className="flex-1"
          />
          <Input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Nome (opcional)"
            className="flex-1"
          />
          <Button onClick={handleAddMember}>
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        
        {/* Members List */}
        <div className="space-y-2">
          <AnimatePresence>
            {myTeam.members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  member.role === 'owner' 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    member.role === 'owner' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {member.name || 'Sem nome'}
                      {member.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                
                {member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
