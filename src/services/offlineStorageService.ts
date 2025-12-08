export interface OfflineContent {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'series';
  genre: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  isOfflineAvailable: boolean;
}

export const offlineStorageService = {
  isDesktopApp(): boolean {
    return typeof window !== 'undefined' && 
           (window.navigator.userAgent.includes('Electron') || 
            localStorage.getItem('isDesktopApp') === 'true');
  },

  saveOfflineContent(content: OfflineContent): void {
    try {
      const contents = this.getOfflineContents();
      contents[content.id] = content;
      localStorage.setItem('offline-contents', JSON.stringify(contents));
    } catch (error) {
      console.error('Error saving offline content:', error);
    }
  },

  getOfflineContents(): Record<string, OfflineContent> {
    try {
      const saved = localStorage.getItem('offline-contents');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading offline contents:', error);
      return {};
    }
  },

  getOfflineContent(id: string): OfflineContent | null {
    const contents = this.getOfflineContents();
    return contents[id] || null;
  },

  removeOfflineContent(id: string): void {
    try {
      const contents = this.getOfflineContents();
      delete contents[id];
      localStorage.setItem('offline-contents', JSON.stringify(contents));
    } catch (error) {
      console.error('Error removing offline content:', error);
    }
  },

  getSyncStatus(): { lastSync: string | null; pendingSync: boolean } {
    try {
      const lastSync = localStorage.getItem('last-sync-timestamp');
      const pendingSync = localStorage.getItem('pending-sync') === 'true';
      return { lastSync, pendingSync };
    } catch (error) {
      return { lastSync: null, pendingSync: false };
    }
  },

  markSyncComplete(): void {
    localStorage.setItem('last-sync-timestamp', new Date().toISOString());
    localStorage.setItem('pending-sync', 'false');
  },

  markPendingSync(): void {
    localStorage.setItem('pending-sync', 'true');
  }
};
