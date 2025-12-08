const TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbService = {
  async searchMulti(query: string, page: number = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  },

  async searchMovies(query: string, page: number = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching movies:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  },

  async searchTV(query: string, page: number = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching TV:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  },

  async getMovieDetails(movieId: number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting movie details:', error);
      return null;
    }
  },

  async getTVDetails(tvId: number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting TV details:', error);
      return null;
    }
  },

  async getTVSeasonDetails(tvId: number, seasonNumber: number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting season details:', error);
      return null;
    }
  },

  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting trending:', error);
      return { results: [] };
    }
  },

  async getPopularMovies(page: number = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting popular movies:', error);
      return { results: [] };
    }
  },

  async getPopularTV(page: number = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting popular TV:', error);
      return { results: [] };
    }
  },

  getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
    if (!path) return '/placeholder.svg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },

  getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }
};
