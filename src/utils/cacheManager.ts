/**
 * A simple in-memory cache utility with TTL (Time To Live).
 * Future Enhancement: Swap the internal Map implementation 
 * to a Redis client (e.g., using `ioredis` or `redis` npm packages)
 * for a distributed cache architecture across multiple server instances.
 */
export class CacheManager {
  private static cache = new Map<string, { value: any; expiry: number }>();
  // Default TTL: 5 minutes (300,000 milliseconds)
  private static defaultTTL = 5 * 60 * 1000;

  /**
   * Generates a predictable string key based on a query object.
   * Useful for caching HTTP responses based on exact parameter matches.
   */
  static generateKey(prefix: string, query: Record<string, any>): string {
    const sortedKeys = Object.keys(query).sort();
    const stringifiedQuery = sortedKeys
      .map((key) => `${key}=${query[key]}`)
      .join("&");
    return `${prefix}?${stringifiedQuery}`;
  }

  /**
   * Attempts to retrieve a value from the cache.
   * Returns null if not found or if the TTL has expired.
   */
  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    if (Date.now() > item.expiry) {
      // Clean up stale cache
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Stores a value in the cache with a specified TTL.
   */
  static set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Clears all items in the cache. Intended for background jobs/testing.
   */
  static clearAll(): void {
    this.cache.clear();
  }
}
