export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  banner?: string;
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
  isPublic?: boolean;
}

// Helper to convert creator-profile format to UserProfile
const convertCreatorProfileToUserProfile = (creatorProfile: any): UserProfile | null => {
  if (!creatorProfile || !creatorProfile.username || !creatorProfile.isPublic) {
    return null;
  }
  
  return {
    id: creatorProfile.username,
    username: creatorProfile.username,
    name: creatorProfile.displayName || creatorProfile.username,
    avatar: creatorProfile.avatar || '/placeholder.svg',
    bio: creatorProfile.bio || 'Criador de conteúdo',
    banner: creatorProfile.banner,
    followers: 1000,
    following: 500,
    totalViews: 50000,
    sponsoredContent: 25,
    earnings: 5000,
    rating: 4.8,
    specialties: creatorProfile.specialties || ['Filmes', 'Séries'],
    socialLinks: creatorProfile.socialLinks || {},
    moviePriceShort: creatorProfile.moviePriceShort || 0,
    moviePriceLong: creatorProfile.moviePriceLong || 0,
    episodePrice: creatorProfile.episodePrice || 0,
    priorityPrice: creatorProfile.priorityPrice || 0,
    isPublic: creatorProfile.isPublic
  };
};

export const profilesApiService = {
  async getProfile(username: string): Promise<UserProfile | null> {
    try {
      // Normalize username (remove @ if present)
      const normalizedUsername = username.replace('@', '').toLowerCase();
      
      // Try creator-profile first (from Lumina Creators)
      const creatorProfile = localStorage.getItem('creator-profile');
      if (creatorProfile) {
        const parsed = JSON.parse(creatorProfile);
        if (parsed.username?.toLowerCase() === normalizedUsername && parsed.isPublic) {
          return convertCreatorProfileToUserProfile(parsed);
        }
      }
      
      // Try public-profiles
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      if (publicProfiles[normalizedUsername]) {
        return publicProfiles[normalizedUsername];
      }
      
      // Try sponsorship-profile (legacy)
      const sponsorshipProfile = localStorage.getItem('sponsorship-profile');
      if (sponsorshipProfile) {
        const parsed = JSON.parse(sponsorshipProfile);
        if (parsed.username?.toLowerCase() === normalizedUsername) {
          return {
            id: normalizedUsername,
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
      publicProfiles[username.toLowerCase()] = {
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
      const results: UserProfile[] = [];
      const lowerQuery = query.toLowerCase().replace('@', '');
      
      // Check creator-profile
      const creatorProfile = localStorage.getItem('creator-profile');
      if (creatorProfile) {
        const parsed = JSON.parse(creatorProfile);
        const userProfile = convertCreatorProfileToUserProfile(parsed);
        if (userProfile) {
          const matchesQuery = !query || 
            userProfile.name.toLowerCase().includes(lowerQuery) ||
            userProfile.username.toLowerCase().includes(lowerQuery);
          if (matchesQuery) {
            results.push(userProfile);
          }
        }
      }
      
      // Check public-profiles
      const publicProfiles = JSON.parse(localStorage.getItem('public-profiles') || '{}');
      const profiles = Object.values(publicProfiles) as UserProfile[];
      
      profiles.forEach(p => {
        const alreadyAdded = results.some(r => r.username.toLowerCase() === p.username.toLowerCase());
        if (!alreadyAdded) {
          const matchesQuery = !query || 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.username.toLowerCase().includes(lowerQuery);
          if (matchesQuery) {
            results.push(p);
          }
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }
};
