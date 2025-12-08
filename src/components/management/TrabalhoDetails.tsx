import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, User, Calendar, DollarSign, Plus, Edit2, Trash2, 
  Briefcase, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Trabalho, Cliente, Servico } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ServicoItem {
  id: string;
  servicoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface TrabalhoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabalho: Trabalho | null;
  cliente: Cliente | null;
  servicos: Servico[];
  onSave: (trabalho: Trabalho) => void;
  onDelete: (id: string) => void;
}

export function TrabalhoDetails({ 
  open, 
  onOpenChange, 
  trabalho, 
  cliente,
  servicos,
  onSave,
  onDelete
}: TrabalhoDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [servicosAdicionais, setServicosAdicionais] = useState<ServicoItem[]>([]);
  const [novoServicoId, setNovoServicoId] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('1');
  const [status, setStatus] = useState<Trabalho['status']>('pendente');

  React.useEffect(() => {
    if (trabalho) {
      setStatus(trabalho.status);
      // Load additional services from localStorage if saved
      const saved = localStorage.getItem(`trabalho_servicos_${trabalho.id}`);
      if (saved) {
        setServicosAdicionais(JSON.parse(saved));
      } else {
        setServicosAdicionais([]);
      }
    }
  }, [trabalho, open]);

  if (!trabalho || !cliente) return null;

  const servicoPrincipal = servicos.find(s => s.id === trabalho.servicoId);

  const handleAddServico = () => {
    if (!novoServicoId) {
      toast({ title: 'Selecione um serviço', variant: 'destructive' });
      return;
    }

    const servico = servicos.find(s => s.id === novoServicoId);
    if (!servico) return;

    const quantidade = parseInt(novaQuantidade) || 1;
    const newItem: ServicoItem = {
      id: Date.now().toString(),
      servicoId: novoServicoId,
      quantidade,
      valorUnitario: servico.valor,
      valorTotal: servico.valor * quantidade
    };

    const updated = [...servicosAdicionais, newItem];
    setServicosAdicionais(updated);
    localStorage.setItem(`trabalho_servicos_${trabalho.id}`, JSON.stringify(updated));
    setNovoServicoId('');
    setNovaQuantidade('1');
    toast({ title: 'Serviço adicionado!' });
  };

  const handleRemoveServico = (id: string) => {
    const updated = servicosAdicionais.filter(s => s.id !== id);
    setServicosAdicionais(updated);
    localStorage.setItem(`trabalho_servicos_${trabalho.id}`, JSON.stringify(updated));
    toast({ title: 'Serviço removido!' });
  };

  const handleStatusChange = (newStatus: Trabalho['status']) => {
    setStatus(newStatus);
    const updatedTrabalho = { ...trabalho, status: newStatus };
    onSave(updatedTrabalho);
    toast({ title: 'Status atualizado!' });
  };

  const valorTotal = trabalho.valor + servicosAdicionais.reduce((sum, s) => sum + s.valorTotal, 0);

  const statusStyles: Record<string, { bg: string; icon: React.ElementType }> = {
    'recebido': { bg: 'bg-success text-white', icon: CheckCircle },
    '50%': { bg: 'bg-warning text-white', icon: AlertCircle },
    'pendente': { bg: 'bg-info text-white', icon: Clock },
    'cancelado': { bg: 'bg-destructive text-white', icon: XCircle }
  };

  const StatusIcon = statusStyles[status]?.icon || Clock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {servicoPrincipal?.nome || trabalho.descricao || 'Trabalho'}
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Projeto #{trabalho.id.slice(-6)}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client & Date Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-medium">{cliente.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium">
                  {new Date(trabalho.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Status Control */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-3">Status do Projeto</p>
            <div className="grid grid-cols-4 gap-2">
              {(['pendente', '50%', 'recebido', 'cancelado'] as const).map((s) => {
                const StyleInfo = statusStyles[s];
                const Icon = StyleInfo.icon;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-xs font-medium",
                      status === s
                        ? `${StyleInfo.bg} border-transparent`
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {s === '50%' ? '50% Pago' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {trabalho.descricao && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Descrição</p>
              <p className="text-sm">{trabalho.descricao}</p>
            </div>
          )}

          {/* Services List */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Serviços do Projeto
            </h3>
            
            <div className="space-y-2">
              {/* Main Service */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{servicoPrincipal?.nome || 'Serviço Principal'}</p>
                    <p className="text-xs text-muted-foreground">Serviço principal</p>
                  </div>
                </div>
                <p className="font-bold text-primary">
                  R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Additional Services */}
              {servicosAdicionais.map((item) => {
                const servico = servicos.find(s => s.id === item.servicoId);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{servico?.nome || 'Serviço'}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantidade}x R$ {item.valorUnitario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        R$ {item.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => handleRemoveServico(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Service Form */}
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-dashed border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3">Adicionar Serviço</p>
              <div className="flex gap-2">
                <Select value={novoServicoId} onValueChange={setNovoServicoId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos.map((servico) => (
                      <SelectItem key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={novaQuantidade}
                  onChange={(e) => setNovaQuantidade(e.target.value)}
                  className="w-20"
                  placeholder="Qtd"
                />
                <Button size="icon" onClick={handleAddServico}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold">Valor Total do Projeto</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => { 
                if (confirm('Tem certeza que deseja excluir este trabalho?')) {
                  onDelete(trabalho.id); 
                  onOpenChange(false); 
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
