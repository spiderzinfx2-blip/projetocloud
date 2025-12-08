import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Users, Star, Heart, DollarSign, MessageCircle, ExternalLink } from 'lucide-react';
import { profilesApiService, UserProfile } from '@/services/profilesApiService';

export default function Patrocinio() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (username) {
      loadProfile(username.replace('@', ''));
    }
  }, [username]);

  const loadProfile = async (user: string) => {
    const profileData = await profilesApiService.getProfile(user);
    if (profileData) {
      setProfile(profileData);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await profilesApiService.searchProfiles(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </GlassButton>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Patrocínios
                </h1>
                <p className="text-sm text-muted-foreground">
                  Descubra criadores e patrocine conteúdo incrível
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Criadores de Conteúdo</h2>
              <p className="text-muted-foreground">Encontre e patrocine seus criadores favoritos</p>
            </div>

            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar criadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <GlassButton onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </GlassButton>
            </div>

            {/* Results */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-6 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span>{user.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {user.bio}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Seguidores</div>
                          <div className="font-semibold">{user.followers?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Visualizações</div>
                          <div className="font-semibold">{user.totalViews?.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {user.specialties?.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <GlassButton size="sm" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Patrocinar
                      </GlassButton>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Descubra Criadores</h3>
                <p className="text-muted-foreground">Use a busca acima para encontrar criadores de conteúdo</p>
              </GlassCard>
            )}
          </div>

          {/* Sidebar - Profile if viewing */}
          <div className="lg:col-span-1">
            {profile ? (
              <GlassCard className="p-6 sticky top-24">
                <div className="text-center mb-6">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-bold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Filme (curto)</span>
                    <span className="font-semibold">R$ {profile.moviePriceShort}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Filme (longo)</span>
                    <span className="font-semibold">R$ {profile.moviePriceLong}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Episódio</span>
                    <span className="font-semibold">R$ {profile.episodePrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prioridade</span>
                    <span className="font-semibold">+R$ {profile.priorityPrice}</span>
                  </div>
                </div>
                
                <GlassButton className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Entrar em Contato
                </GlassButton>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-2">Como funciona?</h3>
                <p className="text-sm text-muted-foreground">
                  Busque criadores de conteúdo e patrocine filmes ou séries que você gostaria de ver revisados.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
