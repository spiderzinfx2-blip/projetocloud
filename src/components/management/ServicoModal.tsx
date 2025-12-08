import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Servico, Categoria } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico?: Servico | null;
  categorias: Categoria[];
  onSave: (servico: Servico) => void;
}

export function ServicoModal({ open, onOpenChange, servico, categorias, onSave }: ServicoModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    categoriaId: ''
  });

  useEffect(() => {
    if (servico) {
      setFormData({
        nome: servico.nome || '',
        descricao: servico.descricao || '',
        valor: servico.valor?.toString() || '',
        categoriaId: servico.categoriaId || ''
      });
    } else {
      setFormData({ nome: '', descricao: '', valor: '', categoriaId: '' });
    }
  }, [servico, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newServico: Servico = {
      id: servico?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nome: formData.nome,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor) || 0,
      categoriaId: formData.categoriaId
    };
    
    onSave(newServico);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{servico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do serviço"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do serviço"
              rows={3}
            />
          </div>
          
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
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={formData.categoriaId} onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }} />
                      {cat.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {servico ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
