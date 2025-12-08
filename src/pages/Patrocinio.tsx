import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Users, Star, Heart, MessageCircle, ArrowLeft, 
  Youtube, Instagram, Twitter, ExternalLink, DollarSign, User
} from 'lucide-react';
import { profilesApiService, UserProfile } from '@/services/profilesApiService';
import { SponsorModal } from '@/components/patrocinio/SponsorModal';
import { ContactModal } from '@/components/patrocinio/ContactModal';
import { cn } from '@/lib/utils';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Creator Public Profile Component
const CreatorPublicProfile = ({ 
  profile, 
  onBack, 
  onSponsor, 
  onContact 
}: { 
  profile: UserProfile; 
  onBack: () => void;
  onSponsor: () => void;
  onContact: () => void;
}) => (
  <div className="space-y-6">
    {/* Back Button */}
    <Button variant="ghost" onClick={onBack} className="gap-2">
      <ArrowLeft className="w-4 h-4" />
      Voltar para Busca
    </Button>

    {/* Profile Header */}
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Banner */}
      <div 
        className="h-40 md:h-56 bg-gradient-to-br from-primary/20 to-primary/5 bg-cover bg-center"
        style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : undefined}
      />
      
      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar && profile.avatar !== '/placeholder.svg' ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-primary/10 border-4 border-background shadow-lg flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          
          {/* Name and Username */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pb-2">
            <Button className="gap-2" onClick={onSponsor}>
              <Heart className="w-4 h-4" />
              Patrocinar
            </Button>
            <Button variant="outline" className="gap-2" onClick={onContact}>
              <MessageCircle className="w-4 h-4" />
              Contato
            </Button>
          </div>
        </div>
        
        {/* Bio */}
        {profile.bio && (
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl">
            {profile.bio}
          </p>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{profile.followers?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">Seguidores</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{profile.totalViews?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">Visualizações</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{profile.sponsoredContent || 0}</p>
            <p className="text-sm text-muted-foreground">Patrocínios</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
              <Star className="w-5 h-5 text-warning fill-warning" />
              {profile.rating?.toFixed(1) || '0.0'}
            </div>
            <p className="text-sm text-muted-foreground">Avaliação</p>
          </div>
        </div>
        
        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Social Links */}
        {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Redes Sociais</h3>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.youtube && (
                <a
                  href={profile.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span className="text-sm font-medium">YouTube</span>
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a
                  href={profile.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              )}
              {profile.socialLinks.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter/X</span>
                </a>
              )}
              {profile.socialLinks.tiktok && (
                <a
                  href={profile.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                >
                  <TikTokIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">TikTok</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Pricing Cards */}
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Tabela de Preços</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors">
          <p className="text-sm text-muted-foreground mb-2">Filme Curto</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {(profile.moviePriceShort || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Até 90 minutos</p>
        </div>
        
        <div className="p-5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors">
          <p className="text-sm text-muted-foreground mb-2">Filme Longo</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {(profile.moviePriceLong || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Acima de 90 minutos</p>
        </div>
        
        <div className="p-5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors">
          <p className="text-sm text-muted-foreground mb-2">Episódio de Série</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {(profile.episodePrice || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Por episódio</p>
        </div>
        
        <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
          <p className="text-sm text-primary mb-2">Prioridade</p>
          <p className="text-2xl font-bold text-primary">
            +R$ {(profile.priorityPrice || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Adicional por conteúdo</p>
        </div>
      </div>
    </div>
  </div>
);

export default function Patrocinio() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  
  // Modal states
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile(username.replace('@', ''));
    } else {
      setProfile(null);
      setViewingProfile(false);
    }
  }, [username]);

  const loadProfile = async (user: string) => {
    const profileData = await profilesApiService.getProfile(user);
    if (profileData) {
      setProfile(profileData);
      setViewingProfile(true);
    } else {
      setProfile(null);
      setViewingProfile(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If empty search, show all public profiles
      const results = await profilesApiService.searchProfiles('');
      setSearchResults(results);
      return;
    }
    
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

  const handleViewProfile = (username: string) => {
    navigate(`/patrocinio/@${username}`);
  };

  const handleBackToSearch = () => {
    navigate('/patrocinio');
  };

  const handleSponsor = (userProfile?: UserProfile) => {
    const targetProfile = userProfile || profile;
    if (targetProfile) {
      setProfile(targetProfile);
      setSponsorModalOpen(true);
    }
  };

  const handleContact = (userProfile?: UserProfile) => {
    const targetProfile = userProfile || profile;
    if (targetProfile) {
      setProfile(targetProfile);
      setContactModalOpen(true);
    }
  };

  // If viewing a specific profile
  if (viewingProfile && profile) {
    return (
      <AppLayout title={profile.name} subtitle={`@${profile.username}`}>
        <CreatorPublicProfile 
          profile={profile} 
          onBack={handleBackToSearch}
          onSponsor={() => handleSponsor()}
          onContact={() => handleContact()}
        />
        
        {/* Modals */}
        <SponsorModal
          open={sponsorModalOpen}
          onOpenChange={setSponsorModalOpen}
          profile={profile}
        />
        <ContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          profile={profile}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Patrocínios" subtitle="Descubra criadores e patrocine conteúdo">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Criadores de Conteúdo</h2>
          <p className="text-muted-foreground mb-4">Encontre e patrocine seus criadores favoritos</p>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou @username..."
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
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-card hover:border-primary/30 transition-all">
                  {/* Mini Banner */}
                  <div 
                    className="h-20 bg-gradient-to-br from-primary/20 to-primary/5 bg-cover bg-center"
                    style={user.banner ? { backgroundImage: `url(${user.banner})` } : undefined}
                  />
                  
                  <div className="p-5 -mt-8">
                    <div className="flex items-end gap-3 mb-4">
                      {user.avatar && user.avatar !== '/placeholder.svg' ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-background"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 border-2 border-background flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium text-foreground">{user.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {user.bio || 'Criador de conteúdo'}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.specialties?.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewProfile(user.username)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSponsor(user)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Patrocinar
                      </Button>
                    </div>
                  </div>
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
            <p className="text-muted-foreground mb-4">
              Use a busca acima para encontrar criadores de conteúdo ou clique em buscar para ver todos os perfis públicos
            </p>
            <Button onClick={handleSearch}>
              Ver Todos os Criadores
            </Button>
          </div>
        )}
      </div>
      
      {/* Modal for sponsoring from search results */}
      {profile && (
        <>
          <SponsorModal
            open={sponsorModalOpen}
            onOpenChange={setSponsorModalOpen}
            profile={profile}
          />
          <ContactModal
            open={contactModalOpen}
            onOpenChange={setContactModalOpen}
            profile={profile}
          />
        </>
      )}
    </AppLayout>
  );
}