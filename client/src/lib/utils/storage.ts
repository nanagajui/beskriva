/**
 * Storage utilities for IndexedDB and localStorage operations
 */

// IndexedDB wrapper for large files and media
export class IndexedDBStorage {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = "lemonfox-storage", version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains("audio")) {
          const audioStore = db.createObjectStore("audio", { keyPath: "id" });
          audioStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        
        if (!db.objectStoreNames.contains("images")) {
          const imageStore = db.createObjectStore("images", { keyPath: "id" });
          imageStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        
        if (!db.objectStoreNames.contains("transcriptions")) {
          const transcriptionStore = db.createObjectStore("transcriptions", { keyPath: "id" });
          transcriptionStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async saveAudio(id: string, blob: Blob, metadata: any = {}): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["audio"], "readwrite");
      const store = transaction.objectStore("audio");
      
      const data = {
        id,
        blob,
        metadata,
        timestamp: new Date(),
      };
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAudio(id: string): Promise<{ blob: Blob; metadata: any } | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["audio"], "readonly");
      const store = transaction.objectStore("audio");
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({ blob: result.blob, metadata: result.metadata });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveImage(id: string, blob: Blob, metadata: any = {}): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["images"], "readwrite");
      const store = transaction.objectStore("images");
      
      const data = {
        id,
        blob,
        metadata,
        timestamp: new Date(),
      };
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(id: string): Promise<{ blob: Blob; metadata: any } | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["images"], "readonly");
      const store = transaction.objectStore("images");
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({ blob: result.blob, metadata: result.metadata });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveTranscription(id: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transcriptions"], "readwrite");
      const store = transaction.objectStore("transcriptions");
      
      const transcription = {
        id,
        data,
        timestamp: new Date(),
      };
      
      const request = store.put(transcription);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTranscription(id: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transcriptions"], "readonly");
      const store = transaction.objectStore("transcriptions");
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAudio(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["audio"], "readwrite");
      const store = transaction.objectStore("audio");
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["images"], "readwrite");
      const store = transaction.objectStore("images");
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    const stores = ["audio", "images", "transcriptions"];
    const promises = stores.map((storeName) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    await Promise.all(promises);
  }

  async getStorageUsage(): Promise<{ audio: number; images: number; total: number }> {
    if (!this.db) await this.init();
    
    const getStoreSize = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const results = request.result;
          let totalSize = 0;
          results.forEach((item) => {
            if (item.blob) {
              totalSize += item.blob.size;
            }
          });
          resolve(totalSize);
        };
        request.onerror = () => reject(request.error);
      });
    };
    
    const [audioSize, imageSize] = await Promise.all([
      getStoreSize("audio"),
      getStoreSize("images"),
    ]);
    
    return {
      audio: audioSize,
      images: imageSize,
      total: audioSize + imageSize,
    };
  }
}

// LocalStorage wrapper with JSON serialization
export class LocalStorage {
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return defaultValue;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }

  static getSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  static getKeys(): string[] {
    return Object.keys(localStorage);
  }
}

// Cache management for API responses
export class CacheManager {
  private static prefix = "lemonfox-cache-";

  static set(key: string, data: any, ttl: number = 3600000): void { // 1 hour default
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    LocalStorage.set(this.prefix + key, item);
  }

  static get<T>(key: string): T | null {
    const item = LocalStorage.get<{ data: T; timestamp: number; ttl: number }>(this.prefix + key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.remove(key);
      return null;
    }
    
    return item.data;
  }

  static remove(key: string): void {
    LocalStorage.remove(this.prefix + key);
  }

  static clear(): void {
    const keys = LocalStorage.getKeys();
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        LocalStorage.remove(key);
      }
    });
  }
}

// Create singleton instances
export const indexedDB = new IndexedDBStorage();
export const cacheManager = CacheManager;
export const localStorage = LocalStorage;
