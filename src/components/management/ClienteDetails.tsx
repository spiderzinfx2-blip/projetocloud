import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Building2, FileText, DollarSign, 
  Calendar, ArrowLeft, Edit2, ExternalLink 
} from 'lucide-react';
import { Cliente, Trabalho, Servico } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ClienteDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  trabalhos: Trabalho[];
  servicos: Servico[];
  onEdit: (cliente: Cliente) => void;
  onViewTrabalho: (trabalho: Trabalho) => void;
}

export function ClienteDetails({ 
  open, 
  onOpenChange, 
  cliente, 
  trabalhos, 
  servicos,
  onEdit,
  onViewTrabalho
}: ClienteDetailsProps) {
  if (!cliente) return null;

  const clienteTrabalhos = trabalhos.filter(t => t.clienteId === cliente.id);
  
  const totalRecebido = clienteTrabalhos.reduce((sum, t) => {
    if (t.status === 'recebido') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0);

  const totalPendente = clienteTrabalhos.reduce((sum, t) => {
    if (t.status === 'pendente') return sum + t.valor;
    if (t.status === '50%') return sum + (t.valor * 0.5);
    return sum;
  }, 0);

  const totalGeral = clienteTrabalhos.reduce((sum, t) => sum + t.valor, 0);

  const statusStyles: Record<string, string> = {
    'recebido': 'bg-success/10 text-success',
    '50%': 'bg-warning/10 text-warning',
    'pendente': 'bg-info/10 text-info',
    'cancelado': 'bg-destructive/10 text-destructive'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {cliente.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{cliente.nome}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {cliente.empresa || 'Sem empresa'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliente.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{cliente.telefone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {cliente.notas && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Observações</p>
              <p className="text-sm">{cliente.notas}</p>
            </div>
          )}

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-success/5 border border-success/20 text-center">
              <DollarSign className="w-5 h-5 mx-auto text-success mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Recebido</p>
              <p className="text-lg font-bold text-success">
                R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20 text-center">
              <DollarSign className="w-5 h-5 mx-auto text-warning mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Pendente</p>
              <p className="text-lg font-bold text-warning">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <DollarSign className="w-5 h-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Total Geral</p>
              <p className="text-lg font-bold text-primary">
                R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Work History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Histórico de Trabalhos ({clienteTrabalhos.length})
            </h3>
            
            {clienteTrabalhos.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {clienteTrabalhos.map((trabalho) => {
                  const servico = servicos.find(s => s.id === trabalho.servicoId);
                  
                  return (
                    <div 
                      key={trabalho.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onViewTrabalho(trabalho)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {servico?.nome || trabalho.descricao || 'Serviço'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(trabalho.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", statusStyles[trabalho.status])}
                        >
                          {trabalho.status}
                        </Badge>
                        <p className="font-semibold text-sm">
                          R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum trabalho registrado</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button className="flex-1" onClick={() => { onOpenChange(false); onEdit(cliente); }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
