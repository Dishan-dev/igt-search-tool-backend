/**
 * A simple in-memory cache utility with TTL (Time To Live).
 * Future Enhancement: Swap the internal Map implementation
 * to a Redis client (e.g., using `ioredis` or `redis` npm packages)
 * for a distributed cache architecture across multiple server instances.
 */
export declare class CacheManager {
    private static cache;
    private static defaultTTL;
    /**
     * Generates a predictable string key based on a query object.
     * Useful for caching HTTP responses based on exact parameter matches.
     */
    static generateKey(prefix: string, query: Record<string, any>): string;
    /**
     * Attempts to retrieve a value from the cache.
     * Returns null if not found or if the TTL has expired.
     */
    static get<T>(key: string): T | null;
    /**
     * Stores a value in the cache with a specified TTL.
     */
    static set(key: string, value: any, ttl?: number): void;
    /**
     * Clears all items in the cache. Intended for background jobs/testing.
     */
    static clearAll(): void;
}
//# sourceMappingURL=cacheManager.d.ts.map