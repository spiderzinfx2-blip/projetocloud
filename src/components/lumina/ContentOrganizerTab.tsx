import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Star, X, Film, Tv, Check, Loader2, 
  Eye, Edit2, Trash2, ChevronDown, ChevronRight, User, DollarSign,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { tmdbService } from '@/services/tmdbService';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
  sponsorContact?: string;
  priority?: number;
  isWatched?: boolean;
  addedDate?: string;
  // Episode-level tracking for TV
  sponsoredEpisodes?: {
    season: number;
    episode: number;
    isPaid: boolean;
    isPriority: boolean;
    sponsorName?: string;
    paidDate?: string;
  }[];
  // Season info for TV
  seasons?: {
    season_number: number;
    episode_count: number;
    name: string;
  }[];
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  still_path?: string;
}

export function ContentOrganizerTab() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Episode management
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  
  // Add content modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingContent, setAddingContent] = useState<any | null>(null);
  const [addContentPriority, setAddContentPriority] = useState<number>(1);
  const [addContentSponsor, setAddContentSponsor] = useState<string>('');
  const [addContentPaid, setAddContentPaid] = useState(false);
  const [loadingAddSeasons, setLoadingAddSeasons] = useState(false);
  const [addContentSeasons, setAddContentSeasons] = useState<any[]>([]);
  const [addContentEpisodes, setAddContentEpisodes] = useState<any[]>([]);
  const [addSelectedSeason, setAddSelectedSeason] = useState<number>(1);
  const [addSponsoredEpisodes, setAddSponsoredEpisodes] = useState<{
    season: number;
    episode: number;
    isPaid: boolean;
    isPriority: boolean;
    sponsorName?: string;
  }[]>([]);

  // Load content
  useEffect(() => {
    const saved = localStorage.getItem('organizer-content');
    if (saved) setContent(JSON.parse(saved));
  }, []);

  const saveContent = (newContent: ContentItem[]) => {
    setContent(newContent);
    localStorage.setItem('organizer-content', JSON.stringify(newContent));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await tmdbService.searchMulti(searchQuery);
      setSearchResults(results.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectContent = async (item: any) => {
    // Check if already exists
    if (content.some(c => c.id === item.id)) {
      toast({ title: 'Conteúdo já adicionado', variant: 'destructive' });
      return;
    }

    setAddingContent(item);
    setAddContentPriority(1);
    setAddContentSponsor('');
    setAddContentPaid(false);
    setAddSponsoredEpisodes([]);
    setAddContentSeasons([]);
    setAddContentEpisodes([]);
    
    // Get seasons for TV shows
    if (item.media_type === 'tv') {
      setLoadingAddSeasons(true);
      try {
        const details = await tmdbService.getTVDetails(item.id);
        if (details?.seasons) {
          const filteredSeasons = details.seasons
            .filter((s: any) => s.season_number > 0)
            .map((s: any) => ({
              season_number: s.season_number,
              episode_count: s.episode_count,
              name: s.name
            }));
          setAddContentSeasons(filteredSeasons);
          
          // Load first season episodes
          if (filteredSeasons.length > 0) {
            setAddSelectedSeason(filteredSeasons[0].season_number);
            const seasonData = await tmdbService.getTVSeasonDetails(item.id, filteredSeasons[0].season_number);
            if (seasonData?.episodes) {
              setAddContentEpisodes(seasonData.episodes);
            }
          }
        }
      } catch (error) {
        console.error('Error loading seasons:', error);
      } finally {
        setLoadingAddSeasons(false);
      }
    }
    
    setShowSearchModal(false);
    setShowAddModal(true);
  };

  const loadAddSeasonEpisodes = async (contentId: number, seasonNumber: number) => {
    setAddSelectedSeason(seasonNumber);
    try {
      const data = await tmdbService.getTVSeasonDetails(contentId, seasonNumber);
      if (data?.episodes) {
        setAddContentEpisodes(data.episodes);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  const toggleAddEpisodePaid = (episode: any, paid: boolean) => {
    const existing = addSponsoredEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      const updated = [...addSponsoredEpisodes];
      updated[existing] = { ...updated[existing], isPaid: paid };
      setAddSponsoredEpisodes(updated);
    } else {
      setAddSponsoredEpisodes([
        ...addSponsoredEpisodes,
        { season: episode.season_number, episode: episode.episode_number, isPaid: paid, isPriority: false }
      ]);
    }
  };

  const toggleAddEpisodePriority = (episode: any, priority: boolean) => {
    const existing = addSponsoredEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      const updated = [...addSponsoredEpisodes];
      updated[existing] = { ...updated[existing], isPriority: priority };
      setAddSponsoredEpisodes(updated);
    } else {
      setAddSponsoredEpisodes([
        ...addSponsoredEpisodes,
        { season: episode.season_number, episode: episode.episode_number, isPaid: false, isPriority: priority }
      ]);
    }
  };

  const updateAddEpisodeSponsor = (episode: any, sponsorName: string) => {
    const existing = addSponsoredEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      const updated = [...addSponsoredEpisodes];
      updated[existing] = { ...updated[existing], sponsorName };
      setAddSponsoredEpisodes(updated);
    } else {
      setAddSponsoredEpisodes([
        ...addSponsoredEpisodes,
        { season: episode.season_number, episode: episode.episode_number, isPaid: false, isPriority: false, sponsorName }
      ]);
    }
  };

  const getAddEpisodeStatus = (episode: any) => {
    return addSponsoredEpisodes.find(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );
  };

  const confirmAddContent = () => {
    if (!addingContent) return;

    const contentWithDetails: ContentItem = {
      ...addingContent,
      addedDate: new Date().toISOString(),
      priority: addContentPriority,
      isWatched: false,
      isPaidAdvanced: addContentPaid || !!addContentSponsor,
      sponsorName: addContentSponsor || undefined,
      sponsoredEpisodes: addSponsoredEpisodes,
      seasons: addContentSeasons.length > 0 ? addContentSeasons : undefined
    };

    saveContent([...content, contentWithDetails]);
    setShowAddModal(false);
    setAddingContent(null);
    setSearchQuery('');
    setSearchResults([]);
    toast({ title: 'Conteúdo adicionado!' });
  };

  const handleOpenDetails = async (item: ContentItem) => {
    setSelectedContent(item);
    setShowDetailsModal(true);
    
    if (item.media_type === 'tv' && item.seasons) {
      setSeasons(item.seasons);
      if (item.seasons.length > 0) {
        loadSeasonEpisodes(item.id, item.seasons[0].season_number);
      }
    }
  };

  const loadSeasonEpisodes = async (contentId: number, seasonNumber: number) => {
    setLoadingEpisodes(true);
    setSelectedSeason(seasonNumber);
    try {
      const data = await tmdbService.getTVSeasonDetails(contentId, seasonNumber);
      if (data?.episodes) {
        setEpisodes(data.episodes);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const toggleEpisodePaid = (episode: Episode, paid: boolean) => {
    if (!selectedContent) return;

    const updatedEpisodes = [...(selectedContent.sponsoredEpisodes || [])];
    const existing = updatedEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      updatedEpisodes[existing] = { ...updatedEpisodes[existing], isPaid: paid };
    } else {
      updatedEpisodes.push({
        season: episode.season_number,
        episode: episode.episode_number,
        isPaid: paid,
        isPriority: false,
        paidDate: paid ? new Date().toISOString() : undefined
      });
    }

    const updatedContent = {
      ...selectedContent,
      sponsoredEpisodes: updatedEpisodes
    };

    setSelectedContent(updatedContent);
    saveContent(content.map(c => c.id === selectedContent.id ? updatedContent : c));
  };

  const toggleEpisodePriority = (episode: Episode, priority: boolean) => {
    if (!selectedContent) return;

    const updatedEpisodes = [...(selectedContent.sponsoredEpisodes || [])];
    const existing = updatedEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      updatedEpisodes[existing] = { ...updatedEpisodes[existing], isPriority: priority };
    } else {
      updatedEpisodes.push({
        season: episode.season_number,
        episode: episode.episode_number,
        isPaid: false,
        isPriority: priority
      });
    }

    const updatedContent = {
      ...selectedContent,
      sponsoredEpisodes: updatedEpisodes
    };

    setSelectedContent(updatedContent);
    saveContent(content.map(c => c.id === selectedContent.id ? updatedContent : c));
  };

  const updateEpisodeSponsor = (episode: Episode, sponsorName: string) => {
    if (!selectedContent) return;

    const updatedEpisodes = [...(selectedContent.sponsoredEpisodes || [])];
    const existing = updatedEpisodes.findIndex(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );

    if (existing >= 0) {
      updatedEpisodes[existing] = { ...updatedEpisodes[existing], sponsorName };
    } else {
      updatedEpisodes.push({
        season: episode.season_number,
        episode: episode.episode_number,
        isPaid: false,
        isPriority: false,
        sponsorName
      });
    }

    const updatedContent = {
      ...selectedContent,
      sponsoredEpisodes: updatedEpisodes
    };

    setSelectedContent(updatedContent);
    saveContent(content.map(c => c.id === selectedContent.id ? updatedContent : c));
  };

  const getEpisodeStatus = (episode: Episode) => {
    return selectedContent?.sponsoredEpisodes?.find(
      e => e.season === episode.season_number && e.episode === episode.episode_number
    );
  };

  const removeContent = (id: number) => {
    saveContent(content.filter(c => c.id !== id));
    toast({ title: 'Conteúdo removido!' });
  };

  const updateContentPriority = (id: number, priority: number) => {
    saveContent(content.map(c => c.id === id ? { ...c, priority } : c));
  };

  const updateContentSponsor = (id: number, sponsorName: string) => {
    saveContent(content.map(c => c.id === id ? { ...c, sponsorName, isPaidAdvanced: true } : c));
  };

  const toggleSeasonExpanded = (seasonNumber: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonNumber) 
        ? prev.filter(s => s !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
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
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
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
                        variant={content.some(c => c.id === result.id) ? "secondary" : "default"}
                        onClick={() => handleSelectContent(result)}
                        disabled={content.some(c => c.id === result.id)}
                      >
                        {content.some(c => c.id === result.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Grid */}
      {content.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative"
            >
              <div 
                className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => handleOpenDetails(item)}
              >
                <img
                  src={tmdbService.getImageUrl(item.poster_path)}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.isPaidAdvanced && (
                    <Badge className="bg-success text-xs">
                      <DollarSign className="w-3 h-3" />
                    </Badge>
                  )}
                  {item.priority && item.priority >= 3 && (
                    <Badge className="bg-warning text-xs">
                      <Star className="w-3 h-3 fill-current" />
                    </Badge>
                  )}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium text-white line-clamp-2">
                    {item.title || item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs text-white border-white/30">
                      {item.media_type === 'movie' ? 'Filme' : 'Série'}
                    </Badge>
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeContent(item.id); }}
                    className="p-1.5 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
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

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedContent && (
                <>
                  <img
                    src={tmdbService.getImageUrl(selectedContent.poster_path, 'w92')}
                    alt={selectedContent.title || selectedContent.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedContent.title || selectedContent.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {selectedContent.media_type === 'movie' ? 'Filme' : 'Série'}
                    </Badge>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patrocinador Geral</Label>
                  <Input
                    value={selectedContent.sponsorName || ''}
                    onChange={(e) => updateContentSponsor(selectedContent.id, e.target.value)}
                    placeholder="Nome do patrocinador"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade Geral</Label>
                  <Select 
                    value={selectedContent.priority?.toString() || '1'}
                    onValueChange={(v) => updateContentPriority(selectedContent.id, parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Baixa</SelectItem>
                      <SelectItem value="2">Média</SelectItem>
                      <SelectItem value="3">Alta</SelectItem>
                      <SelectItem value="4">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* For movies: show paid/priority checkboxes */}
              {selectedContent.media_type === 'movie' && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Status do Filme
                  </h4>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={selectedContent.isPaidAdvanced || false}
                        onCheckedChange={(c) => {
                          const updatedContent = { ...selectedContent, isPaidAdvanced: !!c };
                          setSelectedContent(updatedContent);
                          saveContent(content.map(item => item.id === selectedContent.id ? updatedContent : item));
                        }}
                      />
                      <span className={cn(selectedContent.isPaidAdvanced && "text-success font-medium")}>
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        Pago
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={(selectedContent.priority || 1) >= 4}
                        onCheckedChange={(c) => {
                          const newPriority = c ? 4 : 1;
                          const updatedContent = { ...selectedContent, priority: newPriority };
                          setSelectedContent(updatedContent);
                          saveContent(content.map(item => item.id === selectedContent.id ? updatedContent : item));
                        }}
                      />
                      <span className={cn((selectedContent.priority || 1) >= 4 && "text-warning font-medium")}>
                        <Star className="w-3 h-3 inline mr-1" />
                        Prioridade
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Marque se o filme já está pago e/ou tem prioridade
                  </p>
                </div>
              )}

              {/* Episodes for TV Shows */}
              {selectedContent.media_type === 'tv' && selectedContent.seasons && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    Gerenciar Episódios
                  </h4>
                  
                  {/* Season Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedContent.seasons.map((season) => (
                      <Button
                        key={season.season_number}
                        variant={selectedSeason === season.season_number ? "default" : "outline"}
                        size="sm"
                        onClick={() => loadSeasonEpisodes(selectedContent.id, season.season_number)}
                      >
                        T{season.season_number} ({season.episode_count})
                      </Button>
                    ))}
                  </div>
                  
                  {/* Episodes List */}
                  <ScrollArea className="h-[300px] border border-border rounded-lg">
                    {loadingEpisodes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {episodes.map((episode) => {
                          const status = getEpisodeStatus(episode);
                          return (
                            <div 
                              key={episode.id}
                              className="p-3 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={tmdbService.getImageUrl(episode.still_path, 'w185')}
                                  alt={episode.name}
                                  className="w-24 h-14 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    E{episode.episode_number}: {episode.name}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 text-sm">
                                      <Checkbox 
                                        checked={status?.isPaid || false}
                                        onCheckedChange={(c) => toggleEpisodePaid(episode, !!c)}
                                      />
                                      <span className={cn(status?.isPaid && "text-success")}>Pago</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                      <Checkbox 
                                        checked={status?.isPriority || false}
                                        onCheckedChange={(c) => toggleEpisodePriority(episode, !!c)}
                                      />
                                      <span className={cn(status?.isPriority && "text-warning")}>Prioridade</span>
                                    </label>
                                  </div>
                                </div>
                                <div className="w-32">
                                  <Input
                                    placeholder="Patrocinador"
                                    value={status?.sponsorName || ''}
                                    onChange={(e) => updateEpisodeSponsor(episode, e.target.value)}
                                    className="text-xs h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">
                        {selectedContent.sponsoredEpisodes?.filter(e => e.isPaid).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Episódios Pagos</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-warning">
                        {selectedContent.sponsoredEpisodes?.filter(e => e.isPriority).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Com Prioridade</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-muted-foreground">
                        {selectedContent.seasons?.reduce((sum, s) => sum + s.episode_count, 0) || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Total de Episódios</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  variant="destructive"
                  onClick={() => { removeContent(selectedContent.id); setShowDetailsModal(false); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Content Modal - Same style as Edit */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {addingContent && (
                <>
                  <img
                    src={tmdbService.getImageUrl(addingContent.poster_path, 'w92')}
                    alt={addingContent.title || addingContent.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{addingContent.title || addingContent.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {addingContent.media_type === 'movie' ? 'Filme' : 'Série'}
                    </Badge>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {addingContent && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patrocinador Geral</Label>
                  <Input
                    value={addContentSponsor}
                    onChange={(e) => setAddContentSponsor(e.target.value)}
                    placeholder="Nome do patrocinador"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade Geral</Label>
                  <Select 
                    value={addContentPriority.toString()}
                    onValueChange={(v) => setAddContentPriority(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Baixa</SelectItem>
                      <SelectItem value="2">Média</SelectItem>
                      <SelectItem value="3">Alta</SelectItem>
                      <SelectItem value="4">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* For movies: show paid/priority checkboxes */}
              {addingContent.media_type === 'movie' && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Status do Filme
                  </h4>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={addContentPaid}
                        onCheckedChange={(c) => setAddContentPaid(!!c)}
                      />
                      <span className={cn(addContentPaid && "text-success font-medium")}>
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        Pago
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={addContentPriority >= 4}
                        onCheckedChange={(c) => setAddContentPriority(c ? 4 : 1)}
                      />
                      <span className={cn(addContentPriority >= 4 && "text-warning font-medium")}>
                        <Star className="w-3 h-3 inline mr-1" />
                        Prioridade
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Marque se o filme já está pago e/ou tem prioridade
                  </p>
                </div>
              )}

              {/* Episodes for TV Shows */}
              {addingContent.media_type === 'tv' && addContentSeasons.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    Gerenciar Episódios
                  </h4>
                  
                  {loadingAddSeasons ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Season Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {addContentSeasons.map((season) => (
                          <Button
                            key={season.season_number}
                            variant={addSelectedSeason === season.season_number ? "default" : "outline"}
                            size="sm"
                            onClick={() => loadAddSeasonEpisodes(addingContent.id, season.season_number)}
                          >
                            T{season.season_number} ({season.episode_count})
                          </Button>
                        ))}
                      </div>
                      
                      {/* Episodes List */}
                      <ScrollArea className="h-[300px] border border-border rounded-lg">
                        <div className="divide-y divide-border">
                          {addContentEpisodes.map((episode) => {
                            const status = getAddEpisodeStatus(episode);
                            return (
                              <div 
                                key={episode.id}
                                className="p-3 hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={tmdbService.getImageUrl(episode.still_path, 'w185')}
                                    alt={episode.name}
                                    className="w-24 h-14 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      E{episode.episode_number}: {episode.name}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <label className="flex items-center gap-2 text-sm">
                                        <Checkbox 
                                          checked={status?.isPaid || false}
                                          onCheckedChange={(c) => toggleAddEpisodePaid(episode, !!c)}
                                        />
                                        <span className={cn(status?.isPaid && "text-success")}>Pago</span>
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <Checkbox 
                                          checked={status?.isPriority || false}
                                          onCheckedChange={(c) => toggleAddEpisodePriority(episode, !!c)}
                                        />
                                        <span className={cn(status?.isPriority && "text-warning")}>Prioridade</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="w-32">
                                    <Input
                                      placeholder="Patrocinador"
                                      value={status?.sponsorName || ''}
                                      onChange={(e) => updateAddEpisodeSponsor(episode, e.target.value)}
                                      className="text-xs h-8"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-foreground">
                            {addSponsoredEpisodes.filter(e => e.isPaid).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Episódios Pagos</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-warning">
                            {addSponsoredEpisodes.filter(e => e.isPriority).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Com Prioridade</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-muted-foreground">
                            {addContentSeasons.reduce((sum, s) => sum + s.episode_count, 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Total de Episódios</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <div className="flex-1" />
                <Button onClick={confirmAddContent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar ao Organizador
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
