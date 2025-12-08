import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trabalho, Cliente, Servico } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrabalhoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabalho?: Trabalho | null;
  clientes: Cliente[];
  servicos: Servico[];
  onSave: (trabalho: Trabalho) => void;
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
    } else {
      setFormData({
        clienteId: '',
        servicoId: '',
        descricao: '',
        valor: '',
        status: 'pendente',
        data: new Date().toISOString().split('T')[0]
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrabalho: Trabalho = {
      id: trabalho?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      clienteId: formData.clienteId,
      servicoId: formData.servicoId,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor) || 0,
      status: formData.status,
      data: formData.data
    };
    
    onSave(newTrabalho);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{trabalho ? 'Editar Trabalho' : 'Novo Trabalho'}</DialogTitle>
        </DialogHeader>
        
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
            <Label htmlFor="servico">Serviço *</Label>
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
              <Label htmlFor="valor">Valor (R$) *</Label>
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
      </DialogContent>
    </Dialog>
  );
}
