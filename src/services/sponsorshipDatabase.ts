const DB_NAME = 'SponsorshipDB';
const DB_VERSION = 1;

interface SponsorshipData {
  id: string;
  contentId: number;
  contentTitle: string;
  contentType: 'movie' | 'tv';
  sponsorName: string;
  sponsorContact: string;
  isPriority: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalPrice: number;
}

export const sponsorshipDatabase = {
  db: null as IDBDatabase | null,

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('sponsorships')) {
          const store = db.createObjectStore('sponsorships', { keyPath: 'id' });
          store.createIndex('contentId', 'contentId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'username' });
        }
      };
    });
  },

  async saveSponsorship(data: SponsorshipData): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sponsorships'], 'readwrite');
      const store = transaction.objectStore('sponsorships');
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getSponsorships(): Promise<SponsorshipData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sponsorships'], 'readonly');
      const store = transaction.objectStore('sponsorships');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async clearAllData(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sponsorships', 'profiles'], 'readwrite');
      
      transaction.objectStore('sponsorships').clear();
      transaction.objectStore('profiles').clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};
