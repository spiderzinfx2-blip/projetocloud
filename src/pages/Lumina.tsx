import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, Clapperboard, BarChart3, Calendar, DollarSign, Film, Settings, 
  Search, Plus, ExternalLink, Trash2, Wifi, WifiOff, Star, Clock, Check, X, Loader2
} from 'lucide-react';
import { tmdbService } from '@/services/tmdbService';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  isPaidAdvanced?: boolean;
  sponsorName?: string;
  priority?: number;
  isWatched?: boolean;
  addedDate?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'release' | 'premiere' | 'event' | 'deadline';
  description?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  poster_path?: string;
}

export default function Lumina() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sponsorship' | 'organizer' | 'calendar'>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Content state
  const [sponsoredContent, setSponsoredContent] = useState<ContentItem[]>([]);
  const [organizerContent, setOrganizerContent] = useState<ContentItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Monitor online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved data
  useEffect(() => {
    const savedSponsored = localStorage.getItem('sponsored-content');
    const savedOrganizer = localStorage.getItem('organizer-content');
    const savedEvents = localStorage.getItem('calendar-events');
    
    if (savedSponsored) setSponsoredContent(JSON.parse(savedSponsored));
    if (savedOrganizer) setOrganizerContent(JSON.parse(savedOrganizer));
    if (savedEvents) setCalendarEvents(JSON.parse(savedEvents));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await tmdbService.searchMulti(searchQuery);
      setSearchResults(results.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addToOrganizer = (content: ContentItem) => {
    const contentWithConfig = {
      ...content,
      addedDate: new Date().toISOString(),
      priority: 1,
      isWatched: false,
      isPaidAdvanced: false
    };
    
    const updated = [...organizerContent, contentWithConfig];
    setOrganizerContent(updated);
    localStorage.setItem('organizer-content', JSON.stringify(updated));
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromOrganizer = (contentId: number) => {
    const updated = organizerContent.filter(c => c.id !== contentId);
    setOrganizerContent(updated);
    localStorage.setItem('organizer-content', JSON.stringify(updated));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sponsorship', label: 'Patrocínio', icon: DollarSign },
    { id: 'organizer', label: 'Organizador', icon: Film },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </GlassButton>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Clapperboard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Lumina Creators</h1>
                  <p className="text-sm text-white/60">Ferramentas para criadores de conteúdo</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Online Status */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/10">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-orange-400">Offline</span>
                  </>
                )}
              </div>
              
              <ThemeToggle />
              
              <GlassButton variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === tab.id
                      ? 'text-purple-400 border-purple-400 bg-purple-500/10'
                      : 'text-white/60 border-transparent hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <Clapperboard className="h-16 w-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Lumina Creators</h2>
              <p className="text-white/60 max-w-md mx-auto">
                Gerencie seu conteúdo, patrocínios e calendário em um só lugar.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 bg-white/5 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Conteúdo Patrocinado</p>
                    <p className="text-xl font-bold text-white">{sponsoredContent.length}</p>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-4 bg-white/5 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Film className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">No Organizador</p>
                    <p className="text-xl font-bold text-white">{organizerContent.length}</p>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-4 bg-white/5 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Eventos Agendados</p>
                    <p className="text-xl font-bold text-white">{calendarEvents.length}</p>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-4 bg-white/5 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Prioridade Alta</p>
                    <p className="text-xl font-bold text-white">
                      {organizerContent.filter(c => c.priority && c.priority >= 3).length}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Sponsorship Tab */}
        {activeTab === 'sponsorship' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Patrocínios</h2>
              <GlassButton onClick={() => navigate('/patrocinio')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Página Pública
              </GlassButton>
            </div>
            
            <GlassCard className="p-6 bg-white/5 border-white/10">
              <p className="text-white/60 text-center py-8">
                Configure seu perfil de patrocínio para receber solicitações
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Organizer Tab */}
        {activeTab === 'organizer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Organizador de Conteúdo</h2>
              <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
                <DialogTrigger asChild>
                  <GlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Conteúdo
                  </GlassButton>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Buscar Conteúdo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar filmes ou séries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <img
                            src={tmdbService.getImageUrl(result.poster_path, 'w92')}
                            alt={result.title || result.name}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-white">{result.title || result.name}</p>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <Badge variant="outline" className="border-white/20">
                                {result.media_type === 'movie' ? 'Filme' : 'Série'}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                {result.vote_average?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToOrganizer(result)}
                            disabled={organizerContent.some(c => c.id === result.id)}
                          >
                            {organizerContent.some(c => c.id === result.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {organizerContent.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizerContent.map((content) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <img
                        src={tmdbService.getImageUrl(content.poster_path)}
                        alt={content.title || content.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-medium text-white line-clamp-2">
                          {content.title || content.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-white/70">{content.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromOrganizer(content.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 bg-white/5 border-white/10 text-center">
                <Film className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <p className="text-white/60">Nenhum conteúdo no organizador</p>
                <p className="text-sm text-white/40 mt-1">Clique em "Adicionar Conteúdo" para começar</p>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Calendário</h2>
              <GlassButton>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </GlassButton>
            </div>
            
            <GlassCard className="p-6 bg-white/5 border-white/10">
              <p className="text-white/60 text-center py-8">
                Calendário de eventos em desenvolvimento...
              </p>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
