import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Palette, Download, Building2, 
  Save, Check, Moon, Sun, Monitor, Upload, Trash2, FileJson, FileSpreadsheet,
  Volume2, VolumeX, Play, Users
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserData, saveUserData, loadUserData, ConfigEmpresa } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import { notificationSoundService, SoundType } from '@/services/notificationSoundService';
import { TeamManagement } from '@/components/team/TeamManagement';

const themeColors = [
  { id: 'blue', name: 'Azul', primary: '217 91% 60%', accent: '199 89% 48%' },
  { id: 'purple', name: 'Roxo', primary: '262 83% 58%', accent: '280 68% 50%' },
  { id: 'green', name: 'Verde', primary: '142 71% 45%', accent: '160 84% 39%' },
  { id: 'orange', name: 'Laranja', primary: '25 95% 53%', accent: '38 92% 50%' },
  { id: 'pink', name: 'Rosa', primary: '330 81% 60%', accent: '340 75% 55%' },
  { id: 'teal', name: 'Teal', primary: '174 72% 40%', accent: '186 72% 46%' },
];

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'geral' | 'perfil' | 'empresa' | 'aparencia' | 'dados'>('geral');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [notificationVolume, setNotificationVolume] = useState(50);
  const [notificationSoundType, setNotificationSoundType] = useState<SoundType>('notification');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    bio: ''
  });
  
  // Company form
  const [empresaForm, setEmpresaForm] = useState<ConfigEmpresa>({
    nome: '',
    cnpj: '',
    banner: '',
    avatar: ''
  });

  useEffect(() => {
    // Load notification settings from service
    const soundConfig = notificationSoundService.getConfig();
    setNotificationVolume(soundConfig.volume);
    setNotificationSoundType(soundConfig.soundType);
    
    if (user) {
      const saved = loadUserData(user.id);
      if (saved) {
        setUserData(saved);
        setProfileForm({
          nome: user.name || '',
          email: user.email || '',
          cpf: (saved as any).cpf || '',
          telefone: (saved as any).telefone || '',
          bio: (saved as any).bio || ''
        });
        setEmpresaForm(saved.empresaConfig || { nome: '', cnpj: '', banner: '', avatar: '' });
        setSelectedColor((saved as any).themeColor || 'blue');
      }
    }
  }, [user]);

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0];
    setNotificationVolume(volume);
    notificationSoundService.saveConfig({ volume });
  };

  const handleSoundTypeChange = (type: SoundType) => {
    setNotificationSoundType(type);
    notificationSoundService.saveConfig({ soundType: type });
    // Play the selected sound as preview
    notificationSoundService.play(type);
  };

  const handleTestSound = () => {
    notificationSoundService.play();
  };

  const handleSaveProfile = () => {
    if (!user || !userData) return;
    
    const updated = {
      ...userData,
      cpf: profileForm.cpf,
      telefone: profileForm.telefone,
      bio: profileForm.bio
    };
    
    saveUserData(user.id, updated);
    setUserData(updated);
    toast({ title: 'Perfil salvo com sucesso!' });
  };

  const handleSaveEmpresa = () => {
    if (!user || !userData) return;
    
    const updated = {
      ...userData,
      empresaConfig: empresaForm
    };
    
    saveUserData(user.id, updated);
    setUserData(updated);
    toast({ title: 'Configurações da empresa salvas!' });
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    const color = themeColors.find(c => c.id === colorId);
    if (color && user && userData) {
      // Apply color to CSS variables
      document.documentElement.style.setProperty('--primary', color.primary);
      document.documentElement.style.setProperty('--accent', color.accent);
      
      const updated = { ...userData, themeColor: colorId };
      saveUserData(user.id, updated);
      setUserData(updated);
      toast({ title: `Tema ${color.name} aplicado!` });
    }
  };

  const handleExportData = (format: 'json' | 'csv') => {
    if (!userData) return;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast({ title: 'Dados exportados em JSON!' });
    } else {
      // Export as CSV
      let csv = '';
      
      // Clients
      if (userData.clientes?.length) {
        csv += 'CLIENTES\nNome,Email,Telefone,Empresa\n';
        userData.clientes.forEach(c => {
          csv += `"${c.nome}","${c.email || ''}","${c.telefone || ''}","${c.empresa || ''}"\n`;
        });
        csv += '\n';
      }
      
      // Services
      if (userData.servicos?.length) {
        csv += 'SERVIÇOS\nNome,Descrição,Valor\n';
        userData.servicos.forEach(s => {
          csv += `"${s.nome}","${s.descricao || ''}","${s.valor}"\n`;
        });
        csv += '\n';
      }
      
      // Work
      if (userData.trabalhos?.length) {
        csv += 'TRABALHOS\nDescrição,Valor,Status,Data\n';
        userData.trabalhos.forEach(t => {
          csv += `"${t.descricao}","${t.valor}","${t.status}","${t.data}"\n`;
        });
      }
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast({ title: 'Dados exportados em CSV!' });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveUserData(user.id, imported);
        setUserData(imported);
        toast({ title: 'Dados importados com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro ao importar dados', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (!user) return;
    
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      const emptyData: UserData = {
        id: user.id,
        clientes: [],
        servicos: [],
        trabalhos: [],
        categorias: [],
        empresaConfig: { nome: '', cnpj: '', banner: '', avatar: '' },
        notionPages: [],
        trelloBoards: []
      };
      
      saveUserData(user.id, emptyData);
      setUserData(emptyData);
      toast({ title: 'Dados apagados com sucesso!' });
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Users },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'dados', label: 'Dados', icon: Download },
  ];

  return (
    <AppLayout title="Configurações" subtitle="Gerencie suas preferências e dados">
      {/* Tab Navigation */}
      <div className="mb-6 -mx-4 lg:-mx-6 px-4 lg:px-6 border-b border-border overflow-x-auto scrollbar-thin">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Geral Tab */}
        {activeTab === 'geral' && (
          <div className="max-w-2xl space-y-6">
            <TeamManagement />
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === 'perfil' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dados Pessoais</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={profileForm.nome} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profileForm.email} disabled className="bg-muted/50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={profileForm.cpf}
                      onChange={(e) => setProfileForm({ ...profileForm, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={profileForm.telefone}
                      onChange={(e) => setProfileForm({ ...profileForm, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Fale um pouco sobre você..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empresa Tab */}
        {activeTab === 'empresa' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Configurações da Empresa</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={empresaForm.nome}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={empresaForm.cnpj}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>URL do Banner</Label>
                  <Input
                    value={empresaForm.banner}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, banner: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>URL do Avatar/Logo</Label>
                  <Input
                    value={empresaForm.avatar}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                
                <Button onClick={handleSaveEmpresa}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Aparência Tab */}
        {activeTab === 'aparencia' && (
          <div className="max-w-2xl space-y-6">
            {/* Theme Mode */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Modo do Tema</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    theme === 'light'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-sm font-medium">Claro</span>
                  {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    theme === 'dark'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-sm font-medium">Escuro</span>
                  {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            {/* Theme Color */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cor do Tema</h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      selectedColor === color.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: `hsl(${color.primary})` }}
                    />
                    <span className="text-xs font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Sound Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Som de Notificações</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure o alerta sonoro para novos pedidos de patrocínio
              </p>
              
              {/* Sound Type Selector */}
              <div className="space-y-4 mb-6">
                <Label>Tipo de Som</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {notificationSoundService.getSoundTypes().map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => handleSoundTypeChange(sound.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm",
                        notificationSoundType === sound.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                      {sound.name}
                      {notificationSoundType === sound.id && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Volume Slider */}
              <div className="space-y-4">
                <Label>Volume</Label>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={[notificationVolume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium w-12 text-right">{notificationVolume}%</span>
                </div>
                
                {notificationVolume === 0 && (
                  <p className="text-xs text-warning flex items-center gap-1">
                    <VolumeX className="w-3 h-3" />
                    Som de notificações desativado
                  </p>
                )}
              </div>
              
              {/* Test Button */}
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleTestSound}
                disabled={notificationVolume === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Testar Som
              </Button>
            </div>
          </div>
        )}

        {/* Dados Tab */}
        {activeTab === 'dados' && (
          <div className="max-w-2xl space-y-6">
            {/* Export */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Exportar Dados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça backup dos seus dados em diferentes formatos
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => handleExportData('json')}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
                <Button variant="outline" onClick={() => handleExportData('csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Import */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Importar Dados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Restaure seus dados a partir de um backup JSON
              </p>
              
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="max-w-xs"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card rounded-xl border border-destructive/30 p-6">
              <h3 className="text-lg font-semibold text-destructive mb-4">Zona de Perigo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ações irreversíveis que afetam seus dados
              </p>
              
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Todos os Dados
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
