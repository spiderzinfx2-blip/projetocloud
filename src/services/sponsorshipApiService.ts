export interface SponsorshipRequest {
  id: string;
  contentId: number;
  contentTitle: string;
  contentType: 'movie' | 'tv';
  sponsorName: string;
  sponsorContact: string;
  isPriority: boolean;
  episodes?: { season: number; episode: number; name: string }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalPrice: number;
}

export interface SponsorshipSummary {
  contentTitle: string;
  contentType: 'movie' | 'tv';
  episodes?: { season: number; episode: number; name: string }[];
  basePrice: number;
  priorityExtra: number;
  totalPrice: number;
  sponsorName: string;
  sponsorContact: string;
}

export const sponsorshipApiService = {
  async getProfile(username: string, auth?: any) {
    try {
      // Try to get from localStorage (public profiles)
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      const profile = publicProfiles[username];
      
      if (profile) {
        return { success: true, data: profile };
      }
      
      // Try sponsorship-profile
      const savedProfile = localStorage.getItem('sponsorship-profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.username === username) {
          return { success: true, data: parsed };
        }
      }
      
      return { success: false, error: 'Perfil não encontrado' };
    } catch (error) {
      return { success: false, error: 'Erro ao carregar perfil' };
    }
  },

  async searchContent(query: string, type: 'all' | 'movie' | 'tv' | 'anime' = 'all') {
    try {
      const { tmdbService } = await import('./tmdbService');
      
      let results;
      if (type === 'movie') {
        results = await tmdbService.searchMovies(query);
      } else if (type === 'tv' || type === 'anime') {
        results = await tmdbService.searchTV(query);
      } else {
        results = await tmdbService.searchMulti(query);
      }
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar conteúdo' };
    }
  },

  async createSponsorshipRequest(request: Omit<SponsorshipRequest, 'id' | 'createdAt' | 'status'>) {
    try {
      const newRequest: SponsorshipRequest = {
        ...request,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const requests = JSON.parse(localStorage.getItem('sponsorship-requests') || '[]');
      requests.push(newRequest);
      localStorage.setItem('sponsorship-requests', JSON.stringify(requests));
      
      return { success: true, data: newRequest };
    } catch (error) {
      return { success: false, error: 'Erro ao criar solicitação' };
    }
  },

  async getSponsorshipRequests(username: string) {
    try {
      const requests = JSON.parse(localStorage.getItem('sponsorship-requests') || '[]');
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: 'Erro ao carregar solicitações' };
    }
  },

  calculatePrice(
    contentType: 'movie' | 'tv',
    pricing: { movieShort: number; movieLong: number; seriesEpisode: number; priorityExtra: number },
    episodeCount: number = 1,
    isPriority: boolean = false,
    runtime?: number
  ): number {
    let basePrice = 0;
    
    if (contentType === 'movie') {
      basePrice = runtime && runtime > 120 ? pricing.movieLong : pricing.movieShort;
    } else {
      basePrice = pricing.seriesEpisode * episodeCount;
    }
    
    if (isPriority) {
      basePrice += pricing.priorityExtra;
    }
    
    return basePrice;
  }
};
