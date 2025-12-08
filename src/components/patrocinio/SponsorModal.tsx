import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, Film, Tv, Star, DollarSign, Send, Check, Search, 
  Loader2, ChevronRight, ChevronLeft, Download, AlertTriangle,
  Clock, Info
} from 'lucide-react';
import { UserProfile } from '@/services/profilesApiService';
import { tmdbService } from '@/services/tmdbService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

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
}

interface ExistingContent {
  id: number;
  isPaid: boolean;
  isPriority: boolean;
  episodes?: { season: number; episode: number; isPaid: boolean; isPriority: boolean }[];
}

export function SponsorModal({ open, onOpenChange, profile }: SponsorModalProps) {
  // Steps: 1=search, 2=select episodes (if tv), 3=priority check, 4=summary, 5=final
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
  const [alreadyPaidEpisodes, setAlreadyPaidEpisodes] = useState<SelectedEpisode[]>([]);
  const [priorityOnlyEpisodes, setPriorityOnlyEpisodes] = useState<SelectedEpisode[]>([]);
  
  // Message and final
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
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
    setAlreadyPaidEpisodes([]);
    setPriorityOnlyEpisodes([]);
    setMessage('');
    setSubmitted(false);
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
      checkExistingContent(content.id, 'movie');
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

  const checkExistingContent = (contentId: number, type: 'movie' | 'tv') => {
    // Check organizer content for existing sponsorships
    const organizerContent = JSON.parse(localStorage.getItem('organizer-content') || '[]');
    const found = organizerContent.find((c: any) => c.id === contentId);
    
    if (found) {
      setExistingContent({
        id: found.id,
        isPaid: found.isPaidAdvanced || false,
        isPriority: found.priority >= 3,
        episodes: found.sponsoredEpisodes || []
      });
    } else {
      setExistingContent(null);
    }
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
        id: episode.id
      }]);
    }
  };

  const selectAllEpisodes = () => {
    const allEps = episodes.map(ep => ({
      season: ep.season_number,
      episode: ep.episode_number,
      name: ep.name,
      id: ep.id
    }));
    
    // Merge with existing from other seasons
    const otherSeasons = selectedEpisodes.filter(e => e.season !== selectedSeason);
    setSelectedEpisodes([...otherSeasons, ...allEps]);
  };

  const deselectAllEpisodes = () => {
    setSelectedEpisodes(prev => prev.filter(e => e.season !== selectedSeason));
  };

  // Calculate pricing using useMemo to avoid re-render loops
  const pricing = useMemo(() => {
    if (!selectedContent || !profile) return { base: 0, priority: 0, total: 0 };
    
    let basePrice = 0;
    
    if (selectedContent.media_type === 'movie') {
      const runtime = contentDetails?.runtime || 90;
      basePrice = runtime > 120 
        ? (profile.moviePriceLong || 0) 
        : (profile.moviePriceShort || 0);
    } else {
      // For TV, count episodes minus already paid ones
      const paidEps = existingContent?.episodes?.filter(e => e.isPaid) || [];
      const unpaidSelected = selectedEpisodes.filter(sel => 
        !paidEps.some(p => p.season === sel.season && p.episode === sel.episode)
      );
      
      basePrice = unpaidSelected.length * (profile.episodePrice || 0);
    }
    
    const priorityPrice = wantsPriority ? (profile.priorityPrice || 0) : 0;
    
    return {
      base: basePrice,
      priority: priorityPrice,
      total: basePrice + priorityPrice
    };
  }, [selectedContent, profile, contentDetails, existingContent, selectedEpisodes, wantsPriority]);

  const handleContinueToSummary = () => {
    if (selectedContent?.media_type === 'tv' && selectedEpisodes.length === 0) {
      toast({ title: 'Selecione pelo menos um episódio', variant: 'destructive' });
      return;
    }
    setStep(4);
  };

  const handleSubmit = () => {
    // Save sponsorship request
    const request = {
      id: Date.now().toString(),
      creatorId: profile.id,
      creatorUsername: profile.username,
      creatorName: profile.name,
      contentId: selectedContent?.id,
      contentTitle: selectedContent?.title || selectedContent?.name,
      contentType: selectedContent?.media_type,
      contentPoster: selectedContent?.poster_path,
      episodes: selectedContent?.media_type === 'tv' ? selectedEpisodes : undefined,
      priority: wantsPriority,
      message,
      basePrice: pricing.base,
      priorityPrice: pricing.priority,
      totalPrice: pricing.total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('sponsorship_requests') || '[]');
    existing.push(request);
    localStorage.setItem('sponsorship_requests', JSON.stringify(existing));

    setStep(5);
    setSubmitted(true);
  };

  const handleExportPNG = async () => {
    if (summaryRef.current) {
      try {
        const canvas = await html2canvas(summaryRef.current, {
          backgroundColor: '#1a1a2e',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `patrocinio_${selectedContent?.title || selectedContent?.name}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: 'Imagem exportada com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro ao exportar imagem', variant: 'destructive' });
      }
    }
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
          Selecionar Todos
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
              const isPaid = existingContent?.episodes?.some(
                e => e.season === episode.season_number && e.episode === episode.episode_number && e.isPaid
              );
              const hasPriority = existingContent?.episodes?.some(
                e => e.season === episode.season_number && e.episode === episode.episode_number && e.isPriority
              );
              
              return (
                <button
                  key={episode.id}
                  onClick={() => toggleEpisode(episode)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-muted/30 hover:border-primary/30"
                  )}
                >
                  <Checkbox checked={isSelected} />
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
                      {isPaid && (
                        <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                          Pago
                        </Badge>
                      )}
                      {hasPriority && (
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
      
      {/* Existing content warning if has priority */}
      {existingContent?.isPriority && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Este conteúdo já possui prioridade</p>
            <p className="text-muted-foreground">
              Você não precisa pagar novamente pela prioridade.
            </p>
          </div>
        </div>
      )}
      
      {/* Priority Option */}
      {!existingContent?.isPriority && (
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
      
      {/* Price Summary */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedContent?.media_type === 'movie' 
              ? (contentDetails?.runtime > 120 ? 'Filme Longo' : 'Filme Curto')
              : `${selectedEpisodes.length} Episódio(s)`
            }
          </span>
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

  // Step 4: Summary with message
  const renderSummary = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <h3 className="font-semibold">Resumo do Pedido</h3>
      </div>
      
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
            
            {selectedContent?.media_type === 'tv' && selectedEpisodes.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">Episódios selecionados:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedEpisodes.slice(0, 10).map(ep => (
                    <Badge key={`${ep.season}-${ep.episode}`} variant="secondary" className="text-xs">
                      T{ep.season}E{ep.episode}
                    </Badge>
                  ))}
                  {selectedEpisodes.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedEpisodes.length - 10} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {wantsPriority && (
              <Badge className="mt-2 bg-warning text-warning-foreground">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Com Prioridade
              </Badge>
            )}
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

  // Step 5: Final with export
  const renderFinal = () => (
    <div className="space-y-4">
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
              {selectedContent?.media_type === 'tv' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedEpisodes.length} episódio(s)
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                R$ {pricing.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {wantsPriority && (
                <Badge className="bg-warning/10 text-warning text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Prioridade
                </Badge>
              )}
            </div>
          </div>
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
            <li>Envie a imagem e efetue o pagamento</li>
          </ol>
          
          <div className="mt-4 p-3 rounded bg-muted/50">
            <p className="text-sm font-medium">Contato do Criador:</p>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.socialLinks?.youtube && (
              <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline block">
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
        {step === 4 && renderSummary()}
        {step === 5 && renderFinal()}
      </DialogContent>
    </Dialog>
  );
}
