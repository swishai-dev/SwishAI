import { redis } from "../redis";
import { logger } from "../logger";

/**
 * Check if Redis is available and connected
 */
async function isRedisAvailable(): Promise<boolean> {
  try {
    const status = redis.status;
    if (status === "ready") return true;
    if (status === "connect" || status === "connecting") {
      // Try to ping Redis
      await redis.ping();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export class CacheService {
  private static redisAvailableCache: boolean | null = null;
  private static lastCheckTime: number = 0;
  private static readonly CHECK_INTERVAL = 30000; // Check every 30 seconds

  /**
   * Check Redis availability with caching to avoid excessive checks
   */
  private static async checkRedisAvailability(): Promise<boolean> {
    const now = Date.now();
    if (this.redisAvailableCache === null || (now - this.lastCheckTime) > this.CHECK_INTERVAL) {
      this.redisAvailableCache = await isRedisAvailable();
      this.lastCheckTime = now;
    }
    return this.redisAvailableCache;
  }

  /**
   * Gets a value from cache with an optional simulation delay.
   * Returns null if Redis is not available (graceful degradation).
   */
  static async get<T>(key: string, simulateDelay: boolean = false): Promise<T | null> {
    const available = await this.checkRedisAvailability();
    if (!available) {
      // Redis not available - silent fail (graceful degradation)
      return null;
    }

    try {
      const data = await redis.get(key);
      
      if (data && simulateDelay) {
        // Simulate "AI Analysis" delay for cached hits
        const delay = Math.floor(Math.random() * 1000) + 500; // 500ms - 1500ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      // Only log actual errors, not connection issues (which are handled above)
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes("Connection") && !errorMessage.includes("ECONNREFUSED")) {
        logger.warn(`Redis Get Error for key ${key.substring(0, 50)}...:`, {
          error: errorMessage.substring(0, 100),
        });
      }
      // Reset availability cache on error
      this.redisAvailableCache = false;
      return null;
    }
  }

  /**
   * Sets a value in cache with TTL.
   * Silently fails if Redis is not available (graceful degradation).
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const available = await this.checkRedisAvailability();
    if (!available) {
      // Redis not available - silent fail (graceful degradation)
      return;
    }

    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error: any) {
      // Only log actual errors, not connection issues
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes("Connection") && !errorMessage.includes("ECONNREFUSED")) {
        logger.warn(`Redis Set Error for key ${key.substring(0, 50)}...:`, {
          error: errorMessage.substring(0, 100),
        });
      }
      // Reset availability cache on error
      this.redisAvailableCache = false;
    }
  }

  /**
   * Deletes a key from cache.
   * Silently fails if Redis is not available (graceful degradation).
   */
  static async del(key: string): Promise<void> {
    const available = await this.checkRedisAvailability();
    if (!available) {
      // Redis not available - silent fail (graceful degradation)
      return;
    }

    try {
      await redis.del(key);
    } catch (error: any) {
      // Only log actual errors, not connection issues
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes("Connection") && !errorMessage.includes("ECONNREFUSED")) {
        logger.warn(`Redis Del Error for key ${key.substring(0, 50)}...:`, {
          error: errorMessage.substring(0, 100),
        });
      }
      // Reset availability cache on error
      this.redisAvailableCache = false;
    }
  }
}
