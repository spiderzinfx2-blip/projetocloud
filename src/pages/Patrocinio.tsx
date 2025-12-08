import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Star, Heart, MessageCircle } from 'lucide-react';
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
    <AppLayout title="Patrocínios" subtitle="Descubra criadores e patrocine conteúdo">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Criadores de Conteúdo</h2>
            <p className="text-muted-foreground mb-4">Encontre e patrocine seus criadores favoritos</p>
            
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar criadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card rounded-xl border border-border p-5 hover:shadow-card hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span>{user.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Seguidores</p>
                        <p className="font-semibold text-foreground">{user.followers?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Visualizações</p>
                        <p className="font-semibold text-foreground">{user.totalViews?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.specialties?.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button size="sm" className="w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Patrocinar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Descubra Criadores</h3>
              <p className="text-muted-foreground">Use a busca acima para encontrar criadores de conteúdo</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {profile ? (
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="text-center mb-6">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Filme (curto)</span>
                  <span className="font-semibold text-foreground">R$ {profile.moviePriceShort}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Filme (longo)</span>
                  <span className="font-semibold text-foreground">R$ {profile.moviePriceLong}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Episódio</span>
                  <span className="font-semibold text-foreground">R$ {profile.episodePrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prioridade</span>
                  <span className="font-semibold text-foreground">+R$ {profile.priorityPrice}</span>
                </div>
              </div>
              
              <Button className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Entrar em Contato
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">Como funciona?</h3>
              <p className="text-sm text-muted-foreground">
                Busque criadores de conteúdo e patrocine filmes ou séries que você gostaria de ver revisados.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
