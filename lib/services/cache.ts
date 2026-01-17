import { redis } from "../redis";
import { logger } from "../logger";

export class CacheService {
  /**
   * Gets a value from cache with an optional simulation delay.
   */
  static async get<T>(key: string, simulateDelay: boolean = false): Promise<T | null> {
    try {
      const data = await redis.get(key);
      
      if (data && simulateDelay) {
        // Simulate "AI Analysis" delay for cached hits
        const delay = Math.floor(Math.random() * 1000) + 500; // 500ms - 1500ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis Get Error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Sets a value in cache with TTL.
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      logger.error(`Redis Set Error for key ${key}:`, error);
    }
  }

  /**
   * Deletes a key from cache.
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Redis Del Error for key ${key}:`, error);
    }
  }
}
