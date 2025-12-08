import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Download, Settings, X, Edit2, Trash2, Save, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, addWeeks, subWeeks, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'release' | 'premiere' | 'event' | 'deadline' | 'live' | 'recording';
  description?: string;
  time?: string;
  color?: string;
}

interface CalendarDesign {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  showWeekends: boolean;
}

const defaultDesign: CalendarDesign = {
  primaryColor: '#8B5CF6',
  backgroundColor: '#1a1a2e',
  accentColor: '#06B6D4',
  fontFamily: 'Inter',
  showWeekends: true
};

const eventTypes = [
  { value: 'release', label: 'Lançamento', color: 'bg-success' },
  { value: 'premiere', label: 'Estreia', color: 'bg-primary' },
  { value: 'event', label: 'Evento', color: 'bg-warning' },
  { value: 'deadline', label: 'Prazo', color: 'bg-destructive' },
  { value: 'live', label: 'Live', color: 'bg-pink-500' },
  { value: 'recording', label: 'Gravação', color: 'bg-cyan-500' }
];

export function CalendarTab() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [design, setDesign] = useState<CalendarDesign>(defaultDesign);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'event' as CalendarEvent['type'],
    description: ''
  });

  // Load saved data
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    const savedDesign = localStorage.getItem('calendar-design');
    
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedDesign) setDesign(JSON.parse(savedDesign));
  }, []);

  // Save events
  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  // Save design
  const saveDesign = (newDesign: CalendarDesign) => {
    setDesign(newDesign);
    localStorage.setItem('calendar-design', JSON.stringify(newDesign));
    toast({ title: 'Design salvo!' });
  };

  const handleAddEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      toast({ title: 'Preencha título e data', variant: 'destructive' });
      return;
    }

    const newEvent: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: eventForm.title,
      date: eventForm.date,
      time: eventForm.time,
      type: eventForm.type,
      description: eventForm.description
    };

    if (editingEvent) {
      saveEvents(events.map(e => e.id === editingEvent.id ? newEvent : e));
      toast({ title: 'Evento atualizado!' });
    } else {
      saveEvents([...events, newEvent]);
      toast({ title: 'Evento adicionado!' });
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({ title: '', date: '', time: '', type: 'event', description: '' });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time || '',
      type: event.type,
      description: event.description || ''
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
    toast({ title: 'Evento removido!' });
  };

  const handleNewEvent = (date?: Date) => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time: '',
      type: 'event',
      description: ''
    });
    setShowEventModal(true);
  };

  const handleExportPNG = async () => {
    if (calendarRef.current) {
      try {
        const canvas = await html2canvas(calendarRef.current, {
          backgroundColor: design.backgroundColor,
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `calendario_${format(currentDate, 'yyyy-MM')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: 'Calendário exportado com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro ao exportar', variant: 'destructive' });
      }
    }
  };

  const navigatePrevious = () => {
    if (viewMode === 'weekly') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'weekly') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getDaysToShow = () => {
    if (viewMode === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      // Include days from previous month to fill first week
      const startWeek = startOfWeek(start, { weekStartsOn: 0 });
      const endWeek = endOfWeek(end, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: startWeek, end: endWeek });
    }
  };

  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dayStr);
  };

  const days = getDaysToShow();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">Calendário</h2>
        <div className="flex flex-wrap gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'weekly' | 'monthly')}>
            <TabsList>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" onClick={() => setShowDesignModal(true)}>
            <Palette className="w-4 h-4 mr-2" />
            Design
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportPNG}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PNG
          </Button>
          
          <Button size="sm" onClick={() => handleNewEvent()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-3">
        <Button variant="ghost" size="icon" onClick={navigatePrevious}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <h3 className="text-lg font-semibold capitalize">
          {viewMode === 'weekly' 
            ? `Semana de ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'd MMM', { locale: ptBR })}`
            : format(currentDate, 'MMMM yyyy', { locale: ptBR })
          }
        </h3>
        
        <Button variant="ghost" size="icon" onClick={navigateNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="bg-card rounded-xl border border-border overflow-hidden"
        style={{ 
          backgroundColor: design.backgroundColor,
          fontFamily: design.fontFamily
        }}
      >
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, i) => (
            <div 
              key={day} 
              className={cn(
                "p-3 text-center text-sm font-semibold text-muted-foreground",
                !design.showWeekends && (i === 0 || i === 6) && "opacity-50"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={cn(
          "grid grid-cols-7",
          viewMode === 'monthly' ? "min-h-[500px]" : "min-h-[200px]"
        )}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
            const isWeekend = index % 7 === 0 || index % 7 === 6;
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleNewEvent(day)}
                className={cn(
                  "border-r border-b border-border p-2 min-h-[100px] cursor-pointer transition-colors hover:bg-muted/30",
                  !isCurrentMonth && viewMode === 'monthly' && "opacity-40",
                  !design.showWeekends && isWeekend && "opacity-50",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, viewMode === 'weekly' ? 5 : 3).map((event) => {
                    const typeInfo = eventTypes.find(t => t.value === event.type);
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                        className={cn(
                          "w-full text-left text-xs p-1.5 rounded truncate text-white",
                          typeInfo?.color || 'bg-primary'
                        )}
                      >
                        {event.time && <span className="opacity-80">{event.time} </span>}
                        {event.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > (viewMode === 'weekly' ? 5 : 3) && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - (viewMode === 'weekly' ? 5 : 3)} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Próximos Eventos</h3>
        <div className="space-y-2">
          {events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => {
              const typeInfo = eventTypes.find(t => t.value === event.type);
              return (
                <div 
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn("w-3 h-3 rounded-full", typeInfo?.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })}
                      {event.time && ` às ${event.time}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {typeInfo?.label}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditEvent(event)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum evento próximo</p>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Nome do evento"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v as CalendarEvent['type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", type.color)} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Detalhes do evento (opcional)"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              {editingEvent && (
                <Button 
                  variant="destructive" 
                  onClick={() => { handleDeleteEvent(editingEvent.id); setShowEventModal(false); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setShowEventModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEvent}>
                <Save className="w-4 h-4 mr-2" />
                {editingEvent ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Modal */}
      <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalizar Design</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={design.primaryColor}
                  onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.backgroundColor}
                  onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={design.backgroundColor}
                  onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.accentColor}
                  onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={design.accentColor}
                  onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Mostrar Finais de Semana</Label>
              <button
                onClick={() => setDesign({ ...design, showWeekends: !design.showWeekends })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors",
                  design.showWeekends ? 'bg-primary' : 'bg-muted'
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                  design.showWeekends ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDesign(defaultDesign)}>
                Restaurar Padrão
              </Button>
              <Button className="flex-1" onClick={() => { saveDesign(design); setShowDesignModal(false); }}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Design
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
