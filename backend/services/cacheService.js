/**
 * Caching service for performance optimization
 * Uses in-memory caching with expiration
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null if expired
   */
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Set value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      console.log(`Cache expired: ${key}`);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      return true;
    }
    return false;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Cache-aside pattern for database queries
   * @param {string} key - Cache key
   * @param {Function} fetcher - Function to fetch data if cache miss
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} - Cached or fetched value
   */
  async getOrSet(key, fetcher, ttl = 5 * 60 * 1000) {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      console.log(`Cache hit: ${key}`);
      return cached;
    }

    // Cache miss - fetch and store
    console.log(`Cache miss: ${key}`);
    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

// Export singleton instance
export default new CacheService();
