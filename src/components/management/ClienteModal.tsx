import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Cliente } from '@/hooks/useAuth';

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSave: (cliente: Cliente) => void;
}

export function ClienteModal({ open, onOpenChange, cliente, onSave }: ClienteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    notas: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        empresa: cliente.empresa || '',
        notas: cliente.notas || ''
      });
    } else {
      setFormData({ nome: '', email: '', telefone: '', empresa: '', notas: '' });
    }
  }, [cliente, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCliente: Cliente = {
      id: cliente?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...formData
    };
    
    onSave(newCliente);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Observações sobre o cliente"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {cliente ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
