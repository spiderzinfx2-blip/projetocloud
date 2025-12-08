export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  totalViews: number;
  sponsoredContent: number;
  earnings: number;
  rating: number;
  specialties: string[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  contactInfo?: string;
  moviePriceShort?: number;
  moviePriceLong?: number;
  episodePrice?: number;
  priorityPrice?: number;
  customMessage?: string;
}

export const profilesApiService = {
  async getProfile(username: string): Promise<UserProfile | null> {
    try {
      // Try public-profiles first
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      if (publicProfiles[username]) {
        return publicProfiles[username];
      }
      
      // Try sponsorship-profile
      const sponsorshipProfile = localStorage.getItem('sponsorship-profile');
      if (sponsorshipProfile) {
        const parsed = JSON.parse(sponsorshipProfile);
        if (parsed.username === username) {
          return {
            id: username,
            username: parsed.username,
            name: parsed.channelName || parsed.username,
            avatar: '/placeholder.svg',
            bio: parsed.customMessage || 'Criador de conteúdo',
            followers: 1000,
            following: 500,
            totalViews: 50000,
            sponsoredContent: 25,
            earnings: 5000,
            rating: 4.8,
            specialties: ['Filmes', 'Séries'],
            socialLinks: {},
            contactInfo: parsed.contactInfo,
            moviePriceShort: parsed.pricing?.movieShort || 500,
            moviePriceLong: parsed.pricing?.movieLong || 800,
            episodePrice: parsed.pricing?.seriesEpisode || 150,
            priorityPrice: parsed.pricing?.priorityExtra || 200,
            customMessage: parsed.customMessage
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  },

  async saveProfile(username: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      publicProfiles[username] = {
        id: username,
        username,
        ...profileData
      };
      localStorage.setItem('public-profiles', JSON.stringify(publicProfiles));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  async searchProfiles(query: string): Promise<UserProfile[]> {
    try {
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      const profiles = Object.values(publicProfiles) as UserProfile[];
      
      if (!query) return profiles;
      
      const lowerQuery = query.toLowerCase();
      return profiles.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.username.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }
};
