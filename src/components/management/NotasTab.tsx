import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, FileText, Calendar, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  cor: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

interface NotasTabProps {
  notas: Nota[];
  onSave: (notas: Nota[]) => void;
}

const cores = [
  { id: 'blue', value: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'green', value: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'yellow', value: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'purple', value: 'bg-violet-500/10 border-violet-500/30' },
  { id: 'pink', value: 'bg-pink-500/10 border-pink-500/30' },
  { id: 'orange', value: 'bg-orange-500/10 border-orange-500/30' },
];

export function NotasTab({ notas, onSave }: NotasTabProps) {
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNota, setNewNota] = useState({ titulo: '', conteudo: '', cor: 'blue' });

  const handleCreate = () => {
    if (!newNota.titulo.trim()) return;
    
    const nota: Nota = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      titulo: newNota.titulo,
      conteudo: newNota.conteudo,
      cor: newNota.cor,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    
    onSave([...notas, nota]);
    setNewNota({ titulo: '', conteudo: '', cor: 'blue' });
    setIsCreating(false);
  };

  const handleUpdate = () => {
    if (!editingNota) return;
    
    const updated = notas.map(n => 
      n.id === editingNota.id 
        ? { ...editingNota, dataAtualizacao: new Date().toISOString() }
        : n
    );
    
    onSave(updated);
    setEditingNota(null);
  };

  const handleDelete = (id: string) => {
    onSave(notas.filter(n => n.id !== id));
  };

  const getCorClass = (cor: string) => {
    return cores.find(c => c.id === cor)?.value || cores[0].value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Notas</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="space-y-4">
            <Input
              placeholder="Título da nota"
              value={newNota.titulo}
              onChange={(e) => setNewNota({ ...newNota, titulo: e.target.value })}
              className="font-medium"
            />
            <Textarea
              placeholder="Conteúdo..."
              value={newNota.conteudo}
              onChange={(e) => setNewNota({ ...newNota, conteudo: e.target.value })}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Cor:</span>
              {cores.map((cor) => (
                <button
                  key={cor.id}
                  onClick={() => setNewNota({ ...newNota, cor: cor.id })}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform",
                    cor.value,
                    newNota.cor === cor.id && "scale-125 ring-2 ring-primary"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes Grid */}
      {notas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notas.map((nota) => (
            <motion.div
              key={nota.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "rounded-xl border p-5 transition-shadow hover:shadow-card",
                getCorClass(nota.cor)
              )}
            >
              {editingNota?.id === nota.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingNota.titulo}
                    onChange={(e) => setEditingNota({ ...editingNota, titulo: e.target.value })}
                    className="font-medium"
                  />
                  <Textarea
                    value={editingNota.conteudo}
                    onChange={(e) => setEditingNota({ ...editingNota, conteudo: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate} className="flex-1">
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingNota(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground line-clamp-1">{nota.titulo}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingNota(nota)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(nota.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap mb-3">
                    {nota.conteudo || 'Sem conteúdo'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(nota.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Nenhuma nota criada</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Clique em "Nova Nota" para começar</p>
        </div>
      )}
    </div>
  );
}
