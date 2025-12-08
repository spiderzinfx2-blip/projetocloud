import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, GripVertical, MoreHorizontal, Settings2, Edit2, Palette, MoveUp, MoveDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface KanbanCard {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade?: 'baixa' | 'media' | 'alta';
  dataCriacao?: string;
}

interface KanbanColumn {
  id: string;
  titulo: string;
  cor: string;
  cards: KanbanCard[];
}

interface KanbanTabProps {
  columns: KanbanColumn[];
  onSave: (columns: KanbanColumn[]) => void;
}

const colorOptions = [
  { id: 'blue', name: 'Azul', class: 'bg-blue-500' },
  { id: 'cyan', name: 'Ciano', class: 'bg-cyan-500' },
  { id: 'emerald', name: 'Verde', class: 'bg-emerald-500' },
  { id: 'amber', name: 'Âmbar', class: 'bg-amber-500' },
  { id: 'orange', name: 'Laranja', class: 'bg-orange-500' },
  { id: 'red', name: 'Vermelho', class: 'bg-red-500' },
  { id: 'pink', name: 'Rosa', class: 'bg-pink-500' },
  { id: 'purple', name: 'Roxo', class: 'bg-purple-500' },
  { id: 'violet', name: 'Violeta', class: 'bg-violet-500' },
  { id: 'slate', name: 'Cinza', class: 'bg-slate-500' },
];

const priorityColors = {
  baixa: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  media: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  alta: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', titulo: 'A Fazer', cor: 'bg-blue-500', cards: [] },
  { id: 'doing', titulo: 'Fazendo', cor: 'bg-amber-500', cards: [] },
  { id: 'done', titulo: 'Concluído', cor: 'bg-emerald-500', cards: [] },
];

export function KanbanTab({ columns: initialColumns, onSave }: KanbanTabProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialColumns?.length > 0 ? initialColumns : defaultColumns
  );
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; columnId: string } | null>(null);
  
  // Config modal states
  const [showConfig, setShowConfig] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-blue-500');
  
  // Card edit states
  const [editingCard, setEditingCard] = useState<{ card: KanbanCard; columnId: string } | null>(null);

  const updateColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    onSave(newColumns);
  };

  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    
    const card: KanbanCard = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      titulo: newCardTitle,
      prioridade: newCardPriority,
      dataCriacao: new Date().toISOString()
    };
    
    const newColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, card] }
        : col
    );
    
    updateColumns(newColumns);
    setNewCardTitle('');
    setNewCardPriority('media');
    setNewCardColumn(null);
    toast({ title: 'Card adicionado!' });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    );
    updateColumns(newColumns);
    toast({ title: 'Card excluído!' });
  };

  const updateCard = (columnId: string, cardId: string, updates: Partial<KanbanCard>) => {
    const newColumns = columns.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) }
        : col
    );
    updateColumns(newColumns);
  };

  const handleDragStart = (card: KanbanCard, columnId: string) => {
    setDraggedCard({ card, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCard || draggedCard.columnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    const newColumns = columns.map(col => {
      if (col.id === draggedCard.columnId) {
        return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.card.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, cards: [...col.cards, draggedCard.card] };
      }
      return col;
    });

    updateColumns(newColumns);
    setDraggedCard(null);
  };

  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string) => {
    const card = columns.find(c => c.id === fromColumnId)?.cards.find(card => card.id === cardId);
    if (!card) return;

    const newColumns = columns.map(col => {
      if (col.id === fromColumnId) {
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      if (col.id === toColumnId) {
        return { ...col, cards: [...col.cards, card] };
      }
      return col;
    });

    updateColumns(newColumns);
  };

  // Column management
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumn: KanbanColumn = {
      id: Date.now().toString(),
      titulo: newColumnTitle,
      cor: newColumnColor,
      cards: []
    };
    
    updateColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setNewColumnColor('bg-blue-500');
    toast({ title: 'Coluna criada!' });
  };

  const updateColumn = (columnId: string, updates: Partial<KanbanColumn>) => {
    const newColumns = columns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    updateColumns(newColumns);
  };

  const deleteColumn = (columnId: string) => {
    if (columns.length <= 1) {
      toast({ title: 'Deve haver pelo menos uma coluna', variant: 'destructive' });
      return;
    }
    const newColumns = columns.filter(col => col.id !== columnId);
    updateColumns(newColumns);
    toast({ title: 'Coluna excluída!' });
  };

  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    const index = columns.findIndex(c => c.id === columnId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === columns.length - 1)
    ) return;

    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    updateColumns(newColumns);
  };

  const resetToDefault = () => {
    updateColumns(defaultColumns);
    toast({ title: 'Kanban restaurado para o padrão!' });
    setShowConfig(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Kanban</h2>
        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurações do Kanban</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Add New Column */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Nova Coluna</h4>
                <div className="flex gap-3">
                  <Input
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Nome da coluna"
                    className="flex-1"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-24">
                        <div className={cn("w-4 h-4 rounded mr-2", newColumnColor)} />
                        Cor
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {colorOptions.map(color => (
                        <DropdownMenuItem 
                          key={color.id}
                          onClick={() => setNewColumnColor(color.class)}
                        >
                          <div className={cn("w-4 h-4 rounded mr-2", color.class)} />
                          {color.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button onClick={addColumn}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Existing Columns */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Colunas Existentes</h4>
                <div className="space-y-2">
                  {columns.map((column, index) => (
                    <div 
                      key={column.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className={cn("w-4 h-4 rounded shrink-0", column.cor)} />
                      
                      {editingColumn?.id === column.id ? (
                        <Input
                          value={editingColumn.titulo}
                          onChange={(e) => setEditingColumn({ ...editingColumn, titulo: e.target.value })}
                          className="flex-1 h-8"
                          autoFocus
                          onBlur={() => {
                            if (editingColumn.titulo.trim()) {
                              updateColumn(column.id, { titulo: editingColumn.titulo });
                            }
                            setEditingColumn(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editingColumn.titulo.trim()) {
                              updateColumn(column.id, { titulo: editingColumn.titulo });
                              setEditingColumn(null);
                            }
                            if (e.key === 'Escape') setEditingColumn(null);
                          }}
                        />
                      ) : (
                        <span className="flex-1 font-medium text-foreground">{column.titulo}</span>
                      )}
                      
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded">
                        {column.cards.length} cards
                      </span>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveColumn(column.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveColumn(column.id, 'down')}
                          disabled={index === columns.length - 1}
                        >
                          <MoveDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingColumn(column)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Palette className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {colorOptions.map(color => (
                              <DropdownMenuItem 
                                key={color.id}
                                onClick={() => updateColumn(column.id, { cor: color.class })}
                              >
                                <div className={cn("w-4 h-4 rounded mr-2", color.class)} />
                                {color.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteColumn(column.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="pt-4 border-t border-border">
                <Button variant="outline" onClick={resetToDefault} className="text-destructive hover:text-destructive">
                  Restaurar Padrão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-card rounded-xl border border-border overflow-hidden flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className={cn("px-4 py-3 flex items-center justify-between", column.cor)}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{column.titulo}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                  {column.cards.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setNewCardColumn(column.id)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2 min-h-[200px] max-h-[60vh] overflow-y-auto scrollbar-thin">
              {/* Add Card Form */}
              {newCardColumn === column.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-3 space-y-3"
                >
                  <Input
                    placeholder="Título do card"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCard(column.id)}
                    autoFocus
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Prioridade</Label>
                    <div className="flex gap-2">
                      {(['baixa', 'media', 'alta'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setNewCardPriority(p)}
                          className={cn(
                            "px-2 py-1 rounded text-xs border transition-colors",
                            newCardPriority === p ? priorityColors[p] : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addCard(column.id)} className="flex-1">
                      Adicionar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setNewCardColumn(null);
                        setNewCardTitle('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Card List */}
              {column.cards.map((card) => (
                <motion.div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card, column.id)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "bg-background rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing",
                    "hover:border-primary/30 hover:shadow-sm transition-all",
                    draggedCard?.card.id === card.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{card.titulo}</p>
                      {card.prioridade && (
                        <span className={cn(
                          "inline-block mt-1.5 px-2 py-0.5 rounded text-xs border",
                          priorityColors[card.prioridade]
                        )}>
                          {card.prioridade.charAt(0).toUpperCase() + card.prioridade.slice(1)}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {columns.filter(c => c.id !== column.id).map(col => (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => moveCard(card.id, column.id, col.id)}
                          >
                            <div className={cn("w-3 h-3 rounded mr-2", col.cor)} />
                            Mover para {col.titulo}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteCard(column.id, card.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}

              {column.cards.length === 0 && newCardColumn !== column.id && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground/50">Sem cards</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
