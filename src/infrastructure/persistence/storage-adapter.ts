export interface StorageAdapter<T> {
  get(key: string): T | null;
  set(key: string, value: T): boolean;
  remove(key: string): boolean;
  clear(): boolean;
}

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  get(key: string): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Failed to get key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to set key "${key}":`, error);
      return false;
    }
  }

  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Failed to remove key "${key}":`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.warn('[LocalStorageAdapter] Failed to clear storage:', error);
      return false;
    }
  }
}
