import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Trash2, Settings, Check, X, 
  Mail, Crown, Share2, Save, PlusCircle, Copy, Key,
  Shield, ShieldCheck, Eye, Edit, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTeam, TabPermission, MemberPermissions } from '@/hooks/useTeam';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AVAILABLE_TABS = [
  { id: 'lumina', label: 'Lumina Creators', description: 'Organizador de conteúdo e pedidos' },
  { id: 'gerenciamento', label: 'Gerenciamento', description: 'Clientes, serviços e trabalhos' },
  { id: 'patrocinio', label: 'Patrocínio', description: 'Página de patrocínio pública' },
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e estatísticas' },
  { id: 'financas', label: 'Finanças', description: 'Gestão financeira completa' },
];

const PERMISSION_LABELS: Record<TabPermission, { label: string; icon: React.ReactNode; color: string }> = {
  view: { label: 'Visualizar', icon: <Eye className="w-3 h-3" />, color: 'text-muted-foreground' },
  edit: { label: 'Editar', icon: <Edit className="w-3 h-3" />, color: 'text-info' },
  full: { label: 'Completo', icon: <Zap className="w-3 h-3" />, color: 'text-success' },
};

export function TeamManagement() {
  const { 
    myTeam, 
    createTeam, 
    addMember, 
    removeMember, 
    updateSharedTabs,
    updateTeamName,
    deleteTeam,
    createInviteCode,
    deleteInviteCode,
    updateMemberPermissions,
    updateMemberRole
  } = useTeam();
  
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [teamNameEdit, setTeamNameEdit] = useState('');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberPermissions, setMemberPermissions] = useState<MemberPermissions | null>(null);

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

  const handleGenerateCode = () => {
    const code = createInviteCode();
    if (code) {
      toast({ title: `Código gerado: ${code}`, description: 'Válido por 7 dias' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Código copiado!' });
  };

  const handleDeleteCode = (code: string) => {
    deleteInviteCode(code);
    toast({ title: 'Código excluído!' });
  };

  const handleOpenPermissions = (member: any) => {
    setEditingMember(member);
    setMemberPermissions({ ...member.permissions });
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    if (!editingMember || !memberPermissions) return;
    
    updateMemberPermissions(editingMember.id, memberPermissions);
    toast({ title: 'Permissões atualizadas!' });
    setShowPermissionsModal(false);
  };

  const handleChangeRole = (memberId: string, role: 'admin' | 'member') => {
    updateMemberRole(memberId, role);
    toast({ title: 'Cargo atualizado!' });
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

  const validInviteCodes = (myTeam.inviteCodes || []).filter(
    i => new Date(i.expiresAt) > new Date() && !i.usedBy
  );

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

      {/* Invite Codes */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Códigos de Convite</h4>
              <p className="text-sm text-muted-foreground">
                Gere códigos para convidar membros sem precisar do email
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleGenerateCode}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Gerar Código
          </Button>
        </div>

        {validInviteCodes.length > 0 ? (
          <div className="space-y-2">
            {validInviteCodes.map((invite) => (
              <div
                key={invite.code}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <code className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono text-lg">
                    {invite.code}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleCopyCode(invite.code)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCode(invite.code)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum código ativo. Gere um código para convidar membros.
          </p>
        )}
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
              Adicione colaboradores pelo email ou compartilhe um código de convite
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
                    : member.role === 'admin'
                    ? "border-warning/30 bg-warning/5"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    member.role === 'owner' ? "bg-primary text-primary-foreground" : 
                    member.role === 'admin' ? "bg-warning text-warning-foreground" : "bg-muted"
                  )}>
                    {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {member.name || 'Sem nome'}
                      {member.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {member.role === 'admin' && (
                        <ShieldCheck className="w-4 h-4 text-warning" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                
                {member.role !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <Select 
                      value={member.role} 
                      onValueChange={(v) => handleChangeRole(member.id, v as 'admin' | 'member')}
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenPermissions(member)}
                      className="h-8 w-8"
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Permissions Modal */}
      <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Permissões de {editingMember?.name || editingMember?.email}
            </DialogTitle>
          </DialogHeader>
          
          {memberPermissions && (
            <div className="space-y-4">
              {AVAILABLE_TABS.map((tab) => (
                <div key={tab.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{tab.label}</p>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>
                  <Select 
                    value={memberPermissions[tab.id as keyof MemberPermissions]} 
                    onValueChange={(v) => setMemberPermissions({
                      ...memberPermissions,
                      [tab.id]: v as TabPermission
                    })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PERMISSION_LABELS).map(([value, { label, icon }]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {icon}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
