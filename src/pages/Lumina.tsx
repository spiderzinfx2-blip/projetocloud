import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, Calendar, DollarSign, Film, 
  Search, Plus, ExternalLink, Trash2, Star, Check, X, Loader2, Clapperboard, Settings, User
} from 'lucide-react';
import { tmdbService } from '@/services/tmdbService';
import { cn } from '@/lib/utils';
import { CreatorProfileConfig } from '@/components/lumina/CreatorProfileConfig';
import { useAuth } from '@/hooks/useAuth';

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

interface CreatorProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  specialties: string[];
  moviePriceShort: number;
  moviePriceLong: number;
  episodePrice: number;
  priorityPrice: number;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  isPublic: boolean;
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, gradient }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  gradient: string;
}) => (
  <div className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-shadow">
    <div className="flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", gradient)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export default function Lumina() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sponsorship' | 'organizer' | 'calendar' | 'profile'>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Content state
  const [sponsoredContent, setSponsoredContent] = useState<ContentItem[]>([]);
  const [organizerContent, setOrganizerContent] = useState<ContentItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  
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
    const savedProfile = localStorage.getItem('creator-profile');
    
    if (savedSponsored) setSponsoredContent(JSON.parse(savedSponsored));
    if (savedOrganizer) setOrganizerContent(JSON.parse(savedOrganizer));
    if (savedEvents) setCalendarEvents(JSON.parse(savedEvents));
    if (savedProfile) setCreatorProfile(JSON.parse(savedProfile));
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

  const handleSaveCreatorProfile = (profile: CreatorProfile) => {
    setCreatorProfile(profile);
    localStorage.setItem('creator-profile', JSON.stringify(profile));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sponsorship', label: 'Patrocínio', icon: DollarSign },
    { id: 'organizer', label: 'Organizador', icon: Film },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'profile', label: 'Meu Perfil', icon: User },
  ];

  return (
    <AppLayout title="Lumina Creators" subtitle="Ferramentas para criadores de conteúdo">
      {/* Online Status */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
          {isOnline ? (
            <>
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm text-success font-medium">Online</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-sm text-warning font-medium">Offline</span>
            </>
          )}
        </div>
        
        {creatorProfile?.isPublic && creatorProfile?.username && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/patrocinio/@${creatorProfile.username}`)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Perfil Público
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 -mx-4 lg:-mx-6 px-4 lg:px-6 border-b border-border overflow-x-auto scrollbar-thin">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative z-10 text-center">
              <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Lumina Creators</h2>
              <p className="text-white/80 max-w-md mx-auto">
                Gerencie seu conteúdo, patrocínios e calendário em um só lugar.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={DollarSign} 
              label="Conteúdo Patrocinado" 
              value={sponsoredContent.length}
              gradient="from-emerald-500 to-teal-500"
            />
            <StatCard 
              icon={Film} 
              label="No Organizador" 
              value={organizerContent.length}
              gradient="from-violet-500 to-purple-500"
            />
            <StatCard 
              icon={Calendar} 
              label="Eventos Agendados" 
              value={calendarEvents.length}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard 
              icon={Star} 
              label="Prioridade Alta" 
              value={organizerContent.filter(c => c.priority && c.priority >= 3).length}
              gradient="from-amber-500 to-orange-500"
            />
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
            <h2 className="text-xl font-semibold text-foreground">Patrocínios</h2>
            <Button onClick={() => navigate('/patrocinio')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Página Pública
            </Button>
          </div>
          
          {creatorProfile?.isPublic ? (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6">
                {creatorProfile.avatar ? (
                  <img src={creatorProfile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{creatorProfile.displayName}</h3>
                  <p className="text-sm text-muted-foreground">@{creatorProfile.username}</p>
                </div>
                <Badge className="ml-auto bg-success/10 text-success">Perfil Público</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Filme Curto</p>
                  <p className="text-lg font-bold text-foreground">R$ {creatorProfile.moviePriceShort}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Filme Longo</p>
                  <p className="text-lg font-bold text-foreground">R$ {creatorProfile.moviePriceLong}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Episódio</p>
                  <p className="text-lg font-bold text-foreground">R$ {creatorProfile.episodePrice}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Prioridade</p>
                  <p className="text-lg font-bold text-foreground">+R$ {creatorProfile.priorityPrice}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground mb-4">
                Configure seu perfil de criador para receber solicitações de patrocínio
              </p>
              <Button onClick={() => setActiveTab('profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Configurar Perfil
              </Button>
            </div>
          )}
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
            <h2 className="text-xl font-semibold text-foreground">Organizador de Conteúdo</h2>
            <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Conteúdo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buscar Conteúdo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar filmes ou séries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <img
                          src={tmdbService.getImageUrl(result.poster_path, 'w92')}
                          alt={result.title || result.name}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{result.title || result.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {result.media_type === 'movie' ? 'Filme' : 'Série'}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-warning fill-warning" />
                              {result.vote_average?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={organizerContent.some(c => c.id === result.id) ? "secondary" : "default"}
                          onClick={() => addToOrganizer(result)}
                          disabled={organizerContent.some(c => c.id === result.id)}
                        >
                          {organizerContent.some(c => c.id === result.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {organizerContent.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
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
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-xs text-white/70">{content.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromOrganizer(content.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Film className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Nenhum conteúdo no organizador</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Clique em "Adicionar Conteúdo" para começar</p>
            </div>
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
            <h2 className="text-xl font-semibold text-foreground">Calendário</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">Calendário de eventos em desenvolvimento...</p>
          </div>
        </motion.div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <CreatorProfileConfig
          profile={creatorProfile}
          onSave={handleSaveCreatorProfile}
        />
      )}
    </AppLayout>
  );
}
