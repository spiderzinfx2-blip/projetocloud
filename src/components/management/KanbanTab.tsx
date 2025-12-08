import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface KanbanCard {
  id: string;
  titulo: string;
  descricao?: string;
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
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; columnId: string } | null>(null);

  const updateColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    onSave(newColumns);
  };

  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    
    const card: KanbanCard = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      titulo: newCardTitle
    };
    
    const newColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, card] }
        : col
    );
    
    updateColumns(newColumns);
    setNewCardTitle('');
    setNewCardColumn(null);
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Kanban</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
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
            <div className="p-3 space-y-2 min-h-[200px]">
              {/* Add Card Form */}
              {newCardColumn === column.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                >
                  <Input
                    placeholder="Título do card"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCard(column.id)}
                    autoFocus
                  />
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
                      Cancelar
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
                    <p className="text-sm text-foreground flex-1">{card.titulo}</p>
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
                            Mover para {col.titulo}
                          </DropdownMenuItem>
                        ))}
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
