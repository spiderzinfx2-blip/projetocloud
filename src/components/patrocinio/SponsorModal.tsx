import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, Film, Tv, Star, DollarSign, Send, Check, Search, 
  Loader2, ChevronRight, ChevronLeft, Download, AlertTriangle,
  Clock, Info, Copy, User, MessageCircle, Ban
} from 'lucide-react';
import { UserProfile } from '@/services/profilesApiService';
import { tmdbService } from '@/services/tmdbService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { convertAllImagesToBase64 } from '@/utils/imageToBase64';

interface SponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
}

interface TMDBContent {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  number_of_seasons?: number;
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  still_path?: string;
  overview?: string;
  runtime?: number;
}

interface SelectedEpisode {
  season: number;
  episode: number;
  name: string;
  id: number;
  wantsPriority: boolean;
}

interface ExistingContent {
  id: number;
  isPaid: boolean;
  isPriority: boolean;
  episodes?: { season: number; episode: number; isPaid: boolean; isPriority: boolean }[];
}

interface BuyerInfo {
  name: string;
  contactPlatform: string;
  contactValue: string;
  email: string;
}

const contactPlatforms = [
  { value: 'discord', label: 'Discord' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
];

// Generate unique order code
const generateOrderCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function SponsorModal({ open, onOpenChange, profile }: SponsorModalProps) {
  // Steps: 1=search, 2=select episodes (if tv), 3=priority check, 4=buyer info, 5=summary, 6=final
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContent, setSelectedContent] = useState<TMDBContent | null>(null);
  const [contentDetails, setContentDetails] = useState<any>(null);
  
  // Episode selection for TV
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<SelectedEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  
  // Priority and existing content check
  const [wantsPriority, setWantsPriority] = useState(false);
  const [existingContent, setExistingContent] = useState<ExistingContent | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Buyer info
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: '',
    contactPlatform: 'discord',
    contactValue: '',
    email: ''
  });
  
  // Message and final
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const resetModal = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedContent(null);
    setContentDetails(null);
    setSeasons([]);
    setSelectedSeason(1);
    setEpisodes([]);
    setSelectedEpisodes([]);
    setWantsPriority(false);
    setExistingContent(null);
    setIsBlocked(false);
    setBuyerInfo({ name: '', contactPlatform: 'discord', contactValue: '', email: '' });
    setMessage('');
    setSubmitted(false);
    setOrderCode('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await tmdbService.searchMulti(searchQuery);
      const filtered = results.results?.filter((r: any) => 
        r.media_type === 'movie' || r.media_type === 'tv'
      ) || [];
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      toast({ title: 'Erro ao buscar conteúdo', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectContent = async (content: TMDBContent) => {
    setSelectedContent(content);
    
    // Get details for runtime
    if (content.media_type === 'movie') {
      const details = await tmdbService.getMovieDetails(content.id);
      setContentDetails(details);
      const blocked = checkExistingContent(content.id, 'movie');
      if (blocked) {
        setIsBlocked(true);
      }
      setStep(3); // Go to priority check
    } else {
      const details = await tmdbService.getTVDetails(content.id);
      setContentDetails(details);
      if (details?.seasons) {
        setSeasons(details.seasons.filter((s: any) => s.season_number > 0));
      }
      checkExistingContent(content.id, 'tv');
      setStep(2); // Go to episode selection
    }
  };

  const checkExistingContent = (contentId: number, type: 'movie' | 'tv'): boolean => {
    // Check organizer content for existing sponsorships
    const organizerContent = JSON.parse(localStorage.getItem('organizer-content') || '[]');
    const found = organizerContent.find((c: any) => c.id === contentId);
    
    if (found) {
      const existing = {
        id: found.id,
        isPaid: found.isPaidAdvanced || false,
        isPriority: found.priority >= 3,
        episodes: found.sponsoredEpisodes || []
      };
      setExistingContent(existing);
      
      // Block if both paid and priority
      if (existing.isPaid && existing.isPriority) {
        return true;
      }
    } else {
      setExistingContent(null);
    }
    
    return false;
  };

  const loadSeasonEpisodes = async (seasonNumber: number) => {
    if (!selectedContent) return;
    setLoadingEpisodes(true);
    setSelectedSeason(seasonNumber);
    
    try {
      const seasonData = await tmdbService.getTVSeasonDetails(selectedContent.id, seasonNumber);
      if (seasonData?.episodes) {
        setEpisodes(seasonData.episodes);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  useEffect(() => {
    if (step === 2 && seasons.length > 0) {
      loadSeasonEpisodes(seasons[0]?.season_number || 1);
    }
  }, [step, seasons]);

  const toggleEpisode = (episode: Episode) => {
    // Check if episode is blocked (paid + priority)
    const epStatus = existingContent?.episodes?.find(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );
    
    if (epStatus?.isPaid && epStatus?.isPriority) {
      toast({ 
        title: 'Episódio bloqueado', 
        description: 'Este episódio já está pago e com prioridade.',
        variant: 'destructive' 
      });
      return;
    }
    
    const exists = selectedEpisodes.find(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );
    
    if (exists) {
      setSelectedEpisodes(prev => prev.filter(
        e => !(e.season === episode.season_number && e.episode === episode.episode_number)
      ));
    } else {
      setSelectedEpisodes(prev => [...prev, {
        season: episode.season_number,
        episode: episode.episode_number,
        name: episode.name,
        id: episode.id,
        wantsPriority: false
      }]);
    }
  };

  const selectAllEpisodes = () => {
    const allEps = episodes
      .filter(ep => {
        const epStatus = existingContent?.episodes?.find(
          e => e.season === ep.season_number && e.episode === ep.episode_number
        );
        return !(epStatus?.isPaid && epStatus?.isPriority);
      })
      .map(ep => ({
        season: ep.season_number,
        episode: ep.episode_number,
        name: ep.name,
        id: ep.id,
        wantsPriority: false
      }));
    
    // Merge with existing from other seasons
    const otherSeasons = selectedEpisodes.filter(e => e.season !== selectedSeason);
    setSelectedEpisodes([...otherSeasons, ...allEps]);
  };

  const toggleEpisodePriority = (episode: SelectedEpisode) => {
    setSelectedEpisodes(prev => prev.map(ep => 
      ep.season === episode.season && ep.episode === episode.episode
        ? { ...ep, wantsPriority: !ep.wantsPriority }
        : ep
    ));
  };

  const deselectAllEpisodes = () => {
    setSelectedEpisodes(prev => prev.filter(e => e.season !== selectedSeason));
  };

  // Calculate pricing using useMemo to avoid re-render loops
  const pricing = useMemo(() => {
    if (!selectedContent || !profile) return { base: 0, priority: 0, total: 0 };
    
    let basePrice = 0;
    let priorityPrice = 0;
    
    if (selectedContent.media_type === 'movie') {
      // If already paid, only charge priority if applicable
      if (existingContent?.isPaid) {
        basePrice = 0;
      } else {
        const runtime = contentDetails?.runtime || 90;
        basePrice = runtime > 120 
          ? (profile.moviePriceLong || 0) 
          : (profile.moviePriceShort || 0);
      }
      priorityPrice = wantsPriority ? (profile.priorityPrice || 0) : 0;
    } else {
      // For TV, count episodes minus already paid ones
      const paidEps = existingContent?.episodes?.filter(e => e.isPaid) || [];
      const unpaidSelected = selectedEpisodes.filter(sel => 
        !paidEps.some(p => p.season === sel.season && p.episode === sel.episode)
      );
      
      basePrice = unpaidSelected.length * (profile.episodePrice || 0);
      
      // Count episodes with priority
      const episodesWithPriority = selectedEpisodes.filter(ep => ep.wantsPriority).length;
      priorityPrice = episodesWithPriority * (profile.priorityPrice || 0);
    }
    
    return {
      base: basePrice,
      priority: priorityPrice,
      total: basePrice + priorityPrice,
      episodesWithPriority: selectedEpisodes.filter(ep => ep.wantsPriority).length
    };
  }, [selectedContent, profile, contentDetails, existingContent, selectedEpisodes, wantsPriority]);

  const validateBuyerInfo = (): boolean => {
    if (!buyerInfo.name.trim()) {
      toast({ title: 'Preencha seu nome', variant: 'destructive' });
      return false;
    }
    if (!buyerInfo.contactValue.trim()) {
      toast({ title: 'Preencha seu contato', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleContinueToSummary = () => {
    if (selectedContent?.media_type === 'tv' && selectedEpisodes.length === 0) {
      toast({ title: 'Selecione pelo menos um episódio', variant: 'destructive' });
      return;
    }
    if (!validateBuyerInfo()) return;
    setStep(5);
  };

  const handleSubmit = () => {
    const code = generateOrderCode();
    setOrderCode(code);
    
    // Group episodes by season for display
    const episodesBySeason: { [key: number]: SelectedEpisode[] } = {};
    selectedEpisodes.forEach(ep => {
      if (!episodesBySeason[ep.season]) {
        episodesBySeason[ep.season] = [];
      }
      episodesBySeason[ep.season].push(ep);
    });
    
    // Build items array for the order
    const items = selectedContent?.media_type === 'movie' 
      ? [{
          id: selectedContent.id,
          title: selectedContent.title || selectedContent.name || '',
          type: 'movie' as const,
          poster: selectedContent.poster_path || '',
          runtime: contentDetails?.runtime,
          price: pricing.base,
          wantsPriority: wantsPriority
        }]
      : selectedEpisodes.map(ep => ({
          id: ep.id,
          title: selectedContent?.name || selectedContent?.title || '',
          type: 'tv' as const,
          poster: selectedContent?.poster_path || '',
          contentId: selectedContent?.id,
          episodeInfo: {
            seasonNumber: ep.season,
            episodeNumber: ep.episode,
            episodeName: ep.name
          },
          price: profile.episodePrice || 0,
          wantsPriority: ep.wantsPriority // Per-episode priority
        }));
    
    // Create order in the correct format for OrdersTab
    const order = {
      id: Date.now().toString(),
      orderCode: code,
      creatorUsername: profile.username,
      items: items,
      buyerInfo: buyerInfo,
      subtotal: pricing.base,
      priorityTotal: pricing.priority,
      total: pricing.total,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    // Save to sponsor-orders (the key OrdersTab uses)
    const existingOrders = JSON.parse(localStorage.getItem('sponsor-orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('sponsor-orders', JSON.stringify(existingOrders));

    // Also save to legacy keys for backwards compatibility
    const existingRequests = JSON.parse(localStorage.getItem('sponsorship_requests') || '[]');
    existingRequests.push({
      ...order,
      creatorId: profile.id,
      creatorName: profile.name,
      contentId: selectedContent?.id,
      contentTitle: selectedContent?.title || selectedContent?.name,
      contentType: selectedContent?.media_type,
      contentPoster: selectedContent?.poster_path,
      episodes: selectedContent?.media_type === 'tv' ? selectedEpisodes : undefined,
      episodesBySeason: selectedContent?.media_type === 'tv' ? episodesBySeason : undefined,
      priority: wantsPriority,
      message,
      basePrice: pricing.base,
      priorityPrice: pricing.priority,
      totalPrice: pricing.total
    });
    localStorage.setItem('sponsorship_requests', JSON.stringify(existingRequests));

    // Trigger notification for creator
    const notifications = JSON.parse(localStorage.getItem(`creator_notifications_${profile.username}`) || '[]');
    notifications.unshift({
      id: Date.now().toString(),
      type: 'new_order',
      orderCode: code,
      message: `Novo pedido de patrocínio: ${selectedContent?.title || selectedContent?.name}`,
      buyerName: buyerInfo.name,
      createdAt: new Date().toISOString(),
      read: false
    });
    localStorage.setItem(`creator_notifications_${profile.username}`, JSON.stringify(notifications));

    setStep(6);
    setSubmitted(true);
  };

  const handleExportPNG = async () => {
    if (summaryRef.current) {
      try {
        toast({ title: 'Preparando imagem...' });
        
        // Clone the element to manipulate without affecting the original
        const clone = summaryRef.current.cloneNode(true) as HTMLElement;
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.background = '#1a1a2e';
        clone.style.width = summaryRef.current.offsetWidth + 'px';
        clone.style.overflow = 'visible';
        clone.style.padding = '24px';
        document.body.appendChild(clone);
        
        // Fix text truncation in cloned elements
        const truncatedTexts = clone.querySelectorAll('.truncate');
        truncatedTexts.forEach((el) => {
          (el as HTMLElement).style.overflow = 'visible';
          (el as HTMLElement).style.textOverflow = 'clip';
          (el as HTMLElement).style.whiteSpace = 'normal';
          (el as HTMLElement).style.wordBreak = 'break-word';
        });
        
        // Ensure all containers have overflow visible
        const allContainers = clone.querySelectorAll('div');
        allContainers.forEach((el) => {
          (el as HTMLElement).style.overflow = 'visible';
        });
        
        // Convert all TMDB images to base64 using CORS proxy
        await convertAllImagesToBase64(clone);
        
        // Small delay to ensure images are loaded
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(clone, {
          backgroundColor: '#1a1a2e',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        
        document.body.removeChild(clone);
        
        const link = document.createElement('a');
        link.download = `patrocinio_${orderCode}_${selectedContent?.title || selectedContent?.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: 'Imagem exportada com sucesso!' });
      } catch (error) {
        console.error('Export error:', error);
        toast({ title: 'Erro ao exportar imagem', variant: 'destructive' });
      }
    }
  };

  const copyOrderCode = () => {
    navigator.clipboard.writeText(orderCode);
    toast({ title: 'Código copiado!' });
  };

  // Step 1: Search
  const renderSearch = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Busque o filme, série ou anime que deseja patrocinar:
      </p>
      
      <div className="flex gap-2">
        <Input
          placeholder="Ex: Breaking Bad, Loki, Naruto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectContent(result)}
              className="w-full flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <img
                src={tmdbService.getImageUrl(result.poster_path, 'w92')}
                alt={result.title || result.name}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {result.title || result.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {result.media_type === 'movie' ? 'Filme' : 'Série/Anime'}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    {result.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Step 2: Episode Selection (for TV)
  const renderEpisodeSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">{selectedContent?.name}</h3>
          <p className="text-sm text-muted-foreground">Selecione os episódios</p>
        </div>
      </div>
      
      {/* Existing content warning */}
      {existingContent?.isPaid && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Conteúdo já patrocinado</p>
            <p className="text-muted-foreground">
              Alguns episódios podem já estar pagos. Episódios já pagos serão indicados abaixo.
            </p>
          </div>
        </div>
      )}
      
      {/* Season Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {seasons.map((season) => (
          <Button
            key={season.season_number}
            variant={selectedSeason === season.season_number ? "default" : "outline"}
            size="sm"
            onClick={() => loadSeasonEpisodes(season.season_number)}
          >
            T{season.season_number}
          </Button>
        ))}
      </div>
      
      {/* Select/Deselect All */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={selectAllEpisodes}>
          Selecionar Disponíveis
        </Button>
        <Button variant="ghost" size="sm" onClick={deselectAllEpisodes}>
          Limpar Seleção
        </Button>
      </div>
      
      {/* Episodes List */}
      <ScrollArea className="h-[300px]">
        {loadingEpisodes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((episode) => {
              const isSelected = selectedEpisodes.some(
                e => e.season === episode.season_number && e.episode === episode.episode_number
              );
              const epStatus = existingContent?.episodes?.find(
                e => e.season === episode.season_number && e.episode === episode.episode_number
              );
              const isPaid = epStatus?.isPaid;
              const hasPriority = epStatus?.isPriority;
              const isEpisodeBlocked = isPaid && hasPriority;
              
              return (
                <button
                  key={episode.id}
                  onClick={() => toggleEpisode(episode)}
                  disabled={isEpisodeBlocked}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isEpisodeBlocked 
                      ? "border-destructive/30 bg-destructive/5 opacity-60 cursor-not-allowed"
                      : isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-muted/30 hover:border-primary/30"
                  )}
                >
                  {isEpisodeBlocked ? (
                    <Ban className="w-4 h-4 text-destructive" />
                  ) : (
                    <Checkbox checked={isSelected} disabled={isEpisodeBlocked} />
                  )}
                  <img
                    src={tmdbService.getImageUrl(episode.still_path, 'w185')}
                    alt={episode.name}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      E{episode.episode_number}: {episode.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isEpisodeBlocked && (
                        <Badge variant="destructive" className="text-xs">
                          Bloqueado
                        </Badge>
                      )}
                      {isPaid && !hasPriority && (
                        <Badge variant="secondary" className="text-xs bg-info/10 text-info">
                          Pago (pode priorizar)
                        </Badge>
                      )}
                      {hasPriority && !isPaid && (
                        <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                          Prioridade
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      {/* Selected Count */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {selectedEpisodes.length} episódio(s) selecionado(s)
        </p>
        <Button 
          onClick={() => setStep(3)} 
          disabled={selectedEpisodes.length === 0}
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Priority Option
  const renderPriorityOption = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(selectedContent?.media_type === 'tv' ? 2 : 1)}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">{selectedContent?.title || selectedContent?.name}</h3>
          <p className="text-sm text-muted-foreground">Opções de prioridade</p>
        </div>
      </div>
      
      {/* Content Summary */}
      <div className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border">
        <img
          src={tmdbService.getImageUrl(selectedContent?.poster_path, 'w154')}
          alt={selectedContent?.title || selectedContent?.name}
          className="w-20 h-28 object-cover rounded"
        />
        <div>
          <h4 className="font-semibold">{selectedContent?.title || selectedContent?.name}</h4>
          <Badge variant="outline" className="mt-1">
            {selectedContent?.media_type === 'movie' ? 'Filme' : 'Série/Anime'}
          </Badge>
          {selectedContent?.media_type === 'movie' && contentDetails?.runtime && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {contentDetails.runtime} min
            </p>
          )}
          {selectedContent?.media_type === 'tv' && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedEpisodes.length} episódio(s) selecionado(s)
            </p>
          )}
        </div>
      </div>
      
      {/* BLOCKED - Paid AND Priority */}
      {isBlocked && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <Ban className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive">Conteúdo Bloqueado!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Este conteúdo já está completamente patrocinado (pago + prioridade). 
              Não é possível fazer outro pedido para este item.
            </p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => { resetModal(); setStep(1); }}
            >
              Escolher outro conteúdo
            </Button>
          </div>
        </div>
      )}
      
      {/* Warning - Only Paid (no priority) - Can add priority */}
      {!isBlocked && existingContent?.isPaid && !existingContent?.isPriority && (
        <div className="p-3 rounded-lg bg-info/10 border border-info/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info">Conteúdo já pago!</p>
            <p className="text-muted-foreground">
              Este conteúdo já está patrocinado. Se desejar, você pode adicionar prioridade para que seja produzido mais rapidamente.
            </p>
          </div>
        </div>
      )}
      
      {/* Priority Option - Different for Movie vs TV */}
      {!isBlocked && !existingContent?.isPriority && selectedContent?.media_type === 'movie' && (
        <button
          onClick={() => setWantsPriority(!wantsPriority)}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
            wantsPriority
              ? "border-warning bg-warning/5"
              : "border-border hover:border-warning/30"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            wantsPriority ? "bg-warning/10" : "bg-muted"
          )}>
            <Star className={cn("w-6 h-6", wantsPriority ? "text-warning fill-warning" : "text-muted-foreground")} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Adicionar Prioridade</p>
            <p className="text-sm text-muted-foreground">Seu conteúdo será produzido mais rapidamente</p>
          </div>
          <p className="text-lg font-bold text-warning">
            +R$ {(profile.priorityPrice || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </button>
      )}
      
      {/* Per-Episode Priority for TV Shows */}
      {!isBlocked && selectedContent?.media_type === 'tv' && selectedEpisodes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <p className="font-semibold text-sm">Prioridade por Episódio</p>
            </div>
            <p className="text-xs text-muted-foreground">
              +R$ {(profile.priorityPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por episódio
            </p>
          </div>
          
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-2">
              {selectedEpisodes.map((ep) => (
                <button
                  key={`${ep.season}-${ep.episode}`}
                  onClick={() => toggleEpisodePriority(ep)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    ep.wantsPriority
                      ? "border-warning bg-warning/5"
                      : "border-border hover:border-warning/30"
                  )}
                >
                  <Checkbox 
                    checked={ep.wantsPriority} 
                    className={cn(ep.wantsPriority && "border-warning bg-warning text-warning-foreground")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      S{ep.season.toString().padStart(2, '0')}E{ep.episode.toString().padStart(2, '0')}: {ep.name}
                    </p>
                  </div>
                  {ep.wantsPriority && (
                    <Badge className="bg-warning/10 text-warning text-xs">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Prioridade
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
          
          {(pricing as any).episodesWithPriority > 0 && (
            <p className="text-sm text-warning text-center">
              {(pricing as any).episodesWithPriority} episódio(s) com prioridade
            </p>
          )}
        </div>
      )}
      
      {/* Price Summary */}
      {!isBlocked && (
        <>
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedContent?.media_type === 'movie' 
                  ? (existingContent?.isPaid ? 'Já pago' : (contentDetails?.runtime > 120 ? 'Filme Longo' : 'Filme Curto'))
                  : `${selectedEpisodes.length} Episódio(s)`
                }
              </span>
              <span>R$ {pricing.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {pricing.priority > 0 && (
              <div className="flex justify-between text-sm text-warning">
                <span>
                  Prioridade {selectedContent?.media_type === 'tv' 
                    ? `(${(pricing as any).episodesWithPriority} ep.)` 
                    : ''}
                </span>
                <span>+R$ {pricing.priority.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">R$ {pricing.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={() => setStep(4)}>
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Step 4: Buyer Info
  const renderBuyerInfo = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">Suas Informações</h3>
          <p className="text-sm text-muted-foreground">Para que o criador possa entrar em contato</p>
        </div>
      </div>
      
      <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h4 className="font-medium">Dados de Contato</h4>
        </div>
        
        <div className="space-y-2">
          <Label>Seu Nome *</Label>
          <Input
            value={buyerInfo.name}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
            placeholder="Como você quer ser chamado"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Email (opcional)</Label>
          <Input
            type="email"
            value={buyerInfo.email}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
            placeholder="seu@email.com"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Plataforma de Contato *</Label>
            <Select 
              value={buyerInfo.contactPlatform} 
              onValueChange={(v) => setBuyerInfo({ ...buyerInfo, contactPlatform: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contactPlatforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Seu Contato *</Label>
            <Input
              value={buyerInfo.contactValue}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, contactValue: e.target.value })}
              placeholder={
                buyerInfo.contactPlatform === 'discord' ? 'nick#0000' :
                buyerInfo.contactPlatform === 'whatsapp' ? '+55 00 00000-0000' :
                '@seuusername'
              }
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleContinueToSummary}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Step 5: Summary with message
  const renderSummary = () => {
    // Group episodes by season
    const episodesBySeason: { [key: number]: SelectedEpisode[] } = {};
    selectedEpisodes.forEach(ep => {
      if (!episodesBySeason[ep.season]) {
        episodesBySeason[ep.season] = [];
      }
      episodesBySeason[ep.season].push(ep);
    });
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <h3 className="font-semibold">Resumo do Pedido</h3>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div ref={summaryRef} className="p-4 rounded-lg bg-card border border-border space-y-4">
            {/* Header */}
            <div className="text-center pb-4 border-b border-border">
              <h4 className="text-lg font-bold">Solicitação de Patrocínio</h4>
              <p className="text-sm text-muted-foreground">Para: {profile.name} (@{profile.username})</p>
            </div>
            
            {/* Content */}
            <div className="flex gap-4">
              <img
                src={tmdbService.getImageUrl(selectedContent?.poster_path, 'w154')}
                alt={selectedContent?.title || selectedContent?.name}
                className="w-24 h-36 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{selectedContent?.title || selectedContent?.name}</h4>
                <Badge variant="outline" className="mt-1">
                  {selectedContent?.media_type === 'movie' ? 'Filme' : 'Série/Anime'}
                </Badge>
                
                {wantsPriority && (
                  <Badge className="mt-2 ml-2 bg-warning text-warning-foreground">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Com Prioridade
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Episodes List - Full Detail */}
            {selectedContent?.media_type === 'tv' && selectedEpisodes.length > 0 && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
                <p className="font-medium text-sm">Episódios Selecionados ({selectedEpisodes.length}):</p>
                {Object.entries(episodesBySeason).map(([season, eps]) => (
                  <div key={season} className="space-y-1">
                    <p className="text-sm font-semibold text-primary">Temporada {season}</p>
                    <div className="space-y-1 pl-3">
                      {eps.sort((a, b) => a.episode - b.episode).map(ep => (
                        <p key={`${ep.season}-${ep.episode}`} className="text-sm text-muted-foreground">
                          Ep {ep.episode}: {ep.name}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Buyer Info */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="font-medium text-sm mb-2">Dados do Comprador:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="text-foreground">Nome:</span> {buyerInfo.name}</p>
                <p><span className="text-foreground">Contato:</span> {contactPlatforms.find(p => p.value === buyerInfo.contactPlatform)?.label}: {buyerInfo.contactValue}</p>
                {buyerInfo.email && <p><span className="text-foreground">Email:</span> {buyerInfo.email}</p>}
              </div>
            </div>
            
            {/* Pricing */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valor Base</span>
                <span>R$ {pricing.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {wantsPriority && (
                <div className="flex justify-between text-sm text-warning">
                  <span>Prioridade</span>
                  <span>+R$ {pricing.priority.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">R$ {pricing.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Message */}
        <div className="space-y-2">
          <Label>Mensagem para o Criador (opcional)</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Alguma observação ou pedido especial?"
            rows={3}
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Finalizar Pedido
          </Button>
        </div>
      </div>
    );
  };

  // Step 6: Final with export
  const renderFinal = () => {
    // Group episodes by season for display
    const episodesBySeason: { [key: number]: SelectedEpisode[] } = {};
    selectedEpisodes.forEach(ep => {
      if (!episodesBySeason[ep.season]) {
        episodesBySeason[ep.season] = [];
      }
      episodesBySeason[ep.season].push(ep);
    });
    
    return (
      <div className="space-y-4">
        <ScrollArea className="h-[450px]">
          <div ref={summaryRef} className="p-6 rounded-lg bg-card border border-border space-y-4">
            {/* Success Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Pedido Criado!</h2>
              <p className="text-muted-foreground mt-2">
                Seu pedido de patrocínio foi registrado com sucesso.
              </p>
            </div>
            
            {/* Order Code */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-1">Código do Pedido</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-mono font-bold text-primary tracking-wider">{orderCode}</p>
                <Button variant="ghost" size="icon" onClick={copyOrderCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Guarde este código para acompanhar seu pedido
              </p>
            </div>
            
            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex gap-4">
                <img
                  src={tmdbService.getImageUrl(selectedContent?.poster_path, 'w154')}
                  alt={selectedContent?.title || selectedContent?.name}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedContent?.title || selectedContent?.name}</h4>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {selectedContent?.media_type === 'movie' ? 'Filme' : 'Série/Anime'}
                  </Badge>
                  {wantsPriority && (
                    <Badge className="ml-2 bg-warning/10 text-warning text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Prioridade
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    R$ {pricing.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              {/* Full Episode List */}
              {selectedContent?.media_type === 'tv' && selectedEpisodes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <p className="font-medium text-sm">Episódios ({selectedEpisodes.length}):</p>
                  {Object.entries(episodesBySeason).map(([season, eps]) => (
                    <div key={season} className="space-y-1">
                      <p className="text-sm font-semibold text-primary">Temporada {season}</p>
                      <div className="grid grid-cols-1 gap-1 pl-3">
                        {eps.sort((a, b) => a.episode - b.episode).map(ep => (
                          <p key={`${ep.season}-${ep.episode}`} className="text-xs text-muted-foreground">
                            Ep {ep.episode}: {ep.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Próximos Passos</h4>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                <li>Exporte a imagem do pedido clicando no botão abaixo</li>
                <li>Entre em contato com o criador pelos dados abaixo</li>
                <li>Informe o código do pedido e efetue o pagamento</li>
                <li>Aguarde a confirmação do criador</li>
              </ol>
              
              <div className="mt-4 p-3 rounded bg-muted/50">
                <p className="text-sm font-medium mb-2">Contato do Criador:</p>
                {/* Show contactMethods from profile if available */}
                {(profile as any).contactMethods && (profile as any).contactMethods.length > 0 ? (
                  <div className="space-y-1">
                    {(profile as any).contactMethods
                      .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                      .map((contact: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground capitalize">{contact.platform}:</span>
                          <span className="text-foreground font-medium">{contact.value}</span>
                          {contact.isPrimary && (
                            <Badge variant="outline" className="text-xs">Principal</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
                {profile.socialLinks?.youtube && (
                  <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" 
                    className="text-sm text-primary hover:underline block mt-2">
                    YouTube
                  </a>
                )}
                {profile.socialLinks?.instagram && (
                  <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleExportPNG}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PNG
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Patrocinar {profile.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">@{profile.username}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && renderSearch()}
        {step === 2 && renderEpisodeSelection()}
        {step === 3 && renderPriorityOption()}
        {step === 4 && renderBuyerInfo()}
        {step === 5 && renderSummary()}
        {step === 6 && renderFinal()}
      </DialogContent>
    </Dialog>
  );
}
