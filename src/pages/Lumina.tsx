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
  Search, Plus, ExternalLink, Trash2, Star, Check, X, Loader2, Clapperboard, Settings, User, Package
} from 'lucide-react';
import { tmdbService } from '@/services/tmdbService';
import { cn } from '@/lib/utils';
import { CreatorProfileConfig } from '@/components/lumina/CreatorProfileConfig';
import { CalendarTab } from '@/components/lumina/CalendarTab';
import { ContentOrganizerTab } from '@/components/lumina/ContentOrganizerTab';
import { OrdersTab } from '@/components/lumina/OrdersTab';
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
  contactMethods: {
    platform: string;
    value: string;
    isPrimary: boolean;
  }[];
  paymentInfo: string;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sponsorship' | 'orders' | 'organizer' | 'calendar' | 'profile'>('dashboard');
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
    
    // Also save to public-profiles if public
    if (profile.isPublic && profile.username) {
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      publicProfiles[profile.username.toLowerCase()] = {
        id: profile.username,
        username: profile.username,
        name: profile.displayName || profile.username,
        avatar: profile.avatar || '/placeholder.svg',
        bio: profile.bio || 'Criador de conteúdo',
        banner: profile.banner,
        followers: 1000,
        following: 500,
        totalViews: 50000,
        sponsoredContent: 25,
        earnings: 5000,
        rating: 4.8,
        specialties: profile.specialties || ['Filmes', 'Séries'],
        socialLinks: profile.socialLinks || {},
        contactMethods: profile.contactMethods || [],
        paymentInfo: profile.paymentInfo || '',
        moviePriceShort: profile.moviePriceShort || 0,
        moviePriceLong: profile.moviePriceLong || 0,
        episodePrice: profile.episodePrice || 0,
        priorityPrice: profile.priorityPrice || 0,
        isPublic: true
      };
      localStorage.setItem('public-profiles', JSON.stringify(publicProfiles));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sponsorship', label: 'Patrocínio', icon: DollarSign },
    { id: 'orders', label: 'Pedidos', icon: Package },
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

      {/* Orders Tab */}
      {activeTab === 'orders' && <OrdersTab />}

      {/* Organizer Tab */}
      {activeTab === 'organizer' && <ContentOrganizerTab />}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && <CalendarTab />}

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
