import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trabalho, Cliente, Servico } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtraService {
  id: string;
  servicoId: string;
  nome: string;
  valor: number;
  quantidade: number;
}

interface TrabalhoExtended extends Trabalho {
  servicosExtras?: ExtraService[];
  valorTotal?: number;
}

interface TrabalhoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabalho?: TrabalhoExtended | null;
  clientes: Cliente[];
  servicos: Servico[];
  onSave: (trabalho: TrabalhoExtended) => void;
}

export function TrabalhoModal({ open, onOpenChange, trabalho, clientes, servicos, onSave }: TrabalhoModalProps) {
  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    descricao: '',
    valor: '',
    status: 'pendente' as Trabalho['status'],
    data: new Date().toISOString().split('T')[0]
  });
  
  const [servicosExtras, setServicosExtras] = useState<ExtraService[]>([]);
  const [showExtraServices, setShowExtraServices] = useState(false);
  const [selectedExtraService, setSelectedExtraService] = useState('');

  useEffect(() => {
    if (trabalho) {
      setFormData({
        clienteId: trabalho.clienteId || '',
        servicoId: trabalho.servicoId || '',
        descricao: trabalho.descricao || '',
        valor: trabalho.valor?.toString() || '',
        status: trabalho.status || 'pendente',
        data: trabalho.data || new Date().toISOString().split('T')[0]
      });
      setServicosExtras(trabalho.servicosExtras || []);
    } else {
      setFormData({
        clienteId: '',
        servicoId: '',
        descricao: '',
        valor: '',
        status: 'pendente',
        data: new Date().toISOString().split('T')[0]
      });
      setServicosExtras([]);
    }
  }, [trabalho, open]);

  const handleServicoChange = (servicoId: string) => {
    const servico = servicos.find(s => s.id === servicoId);
    setFormData({
      ...formData,
      servicoId,
      valor: servico?.valor?.toString() || formData.valor
    });
  };

  const addExtraService = () => {
    if (!selectedExtraService) return;
    
    const servico = servicos.find(s => s.id === selectedExtraService);
    if (!servico) return;
    
    const newExtra: ExtraService = {
      id: Date.now().toString(),
      servicoId: servico.id,
      nome: servico.nome,
      valor: servico.valor,
      quantidade: 1
    };
    
    setServicosExtras([...servicosExtras, newExtra]);
    setSelectedExtraService('');
  };

  const updateExtraQuantity = (id: string, quantidade: number) => {
    setServicosExtras(servicosExtras.map(e => 
      e.id === id ? { ...e, quantidade: Math.max(1, quantidade) } : e
    ));
  };

  const removeExtraService = (id: string) => {
    setServicosExtras(servicosExtras.filter(e => e.id !== id));
  };

  const calculateTotal = () => {
    const baseValue = parseFloat(formData.valor) || 0;
    const extrasTotal = servicosExtras.reduce((sum, e) => sum + (e.valor * e.quantidade), 0);
    return baseValue + extrasTotal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorBase = parseFloat(formData.valor) || 0;
    const valorTotal = calculateTotal();
    
    const newTrabalho: TrabalhoExtended = {
      id: trabalho?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      clienteId: formData.clienteId,
      servicoId: formData.servicoId,
      descricao: formData.descricao,
      valor: valorBase,
      valorTotal: valorTotal,
      status: formData.status,
      data: formData.data,
      servicosExtras: servicosExtras.length > 0 ? servicosExtras : undefined
    };
    
    onSave(newTrabalho);
    onOpenChange(false);
  };

  const availableExtras = servicos.filter(s => s.id !== formData.servicoId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{trabalho ? 'Editar Trabalho' : 'Novo Trabalho'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servico">Serviço Principal *</Label>
              <Select value={formData.servicoId} onValueChange={handleServicoChange}>
                <SelectTrigger>
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
            </div>

            {/* Extra Services Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Serviços Extras</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExtraServices(!showExtraServices)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Extra
                </Button>
              </div>
              
              {showExtraServices && (
                <div className="flex gap-2">
                  <Select value={selectedExtraService} onValueChange={setSelectedExtraService}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um serviço extra" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExtras.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          {servico.nome} - R$ {servico.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addExtraService} disabled={!selectedExtraService}>
                    Adicionar
                  </Button>
                </div>
              )}
              
              {servicosExtras.length > 0 && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                  {servicosExtras.map((extra) => (
                    <div key={extra.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{extra.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {extra.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / un
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateExtraQuantity(extra.id, extra.quantidade - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm">{extra.quantidade}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateExtraQuantity(extra.id, extra.quantidade + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Badge variant="secondary" className="min-w-[80px] justify-center">
                        R$ {(extra.valor * extra.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeExtraService(extra.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Detalhes do trabalho"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Base (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Total Summary */}
            {servicosExtras.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Base:</span>
                  <span>R$ {(parseFloat(formData.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Extras ({servicosExtras.length}):</span>
                  <span>R$ {servicosExtras.reduce((sum, e) => sum + (e.valor * e.quantidade), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-border">
                  <span>Total:</span>
                  <span className="text-primary">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Trabalho['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="50%">50% Pago</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {trabalho ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
