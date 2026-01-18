import { kv } from "@vercel/kv";
import { logger } from "./logger";

/**
 * Vercel KV wrapper that provides Redis-like interface
 * Falls back gracefully if KV is not configured
 */

// Check if Vercel KV is configured
const isKVConfigured = () => {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
};

/**
 * Redis-like interface using Vercel KV
 * Compatible with existing code that expects Redis methods
 */
export const redis = {
  /**
   * Get a value from KV
   */
  async get(key: string): Promise<string | null> {
    if (!isKVConfigured()) {
      if (process.env.NODE_ENV === "development") {
        logger.debug("Vercel KV not configured - get operation skipped");
      }
      return null;
    }

    try {
      const value = await kv.get<string>(key);
      return value || null;
    } catch (error: any) {
      logger.warn("KV Get Error:", {
        key: key.substring(0, 50),
        error: error?.message || String(error),
      });
      return null;
    }
  },

  /**
   * Set a value in KV with TTL
   */
  async set(key: string, value: string, mode?: string, ttl?: number): Promise<void> {
    if (!isKVConfigured()) {
      if (process.env.NODE_ENV === "development") {
        logger.debug("Vercel KV not configured - set operation skipped");
      }
      return;
    }

    try {
      if (mode === "EX" && ttl) {
        // Set with expiration
        await kv.set(key, value, { ex: ttl });
      } else {
        await kv.set(key, value);
      }
    } catch (error: any) {
      logger.warn("KV Set Error:", {
        key: key.substring(0, 50),
        error: error?.message || String(error),
      });
    }
  },

  /**
   * Delete a key from KV
   */
  async del(key: string): Promise<void> {
    if (!isKVConfigured()) {
      if (process.env.NODE_ENV === "development") {
        logger.debug("Vercel KV not configured - del operation skipped");
      }
      return;
    }

    try {
      await kv.del(key);
    } catch (error: any) {
      logger.warn("KV Del Error:", {
        key: key.substring(0, 50),
        error: error?.message || String(error),
      });
    }
  },

  /**
   * Increment a key (for rate limiting)
   */
  async incr(key: string): Promise<number> {
    if (!isKVConfigured()) {
      if (process.env.NODE_ENV === "development") {
        logger.debug("Vercel KV not configured - incr operation skipped");
      }
      return 0;
    }

    try {
      const current = await kv.get<number>(key) || 0;
      const newValue = current + 1;
      await kv.set(key, newValue);
      return newValue;
    } catch (error: any) {
      logger.warn("KV Incr Error:", {
        key: key.substring(0, 50),
        error: error?.message || String(error),
      });
      return 0;
    }
  },

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (!isKVConfigured()) {
      return;
    }

    try {
      // Vercel KV doesn't have separate expire command
      // We need to re-set with expiration
      const value = await kv.get(key);
      if (value !== null) {
        await kv.set(key, value, { ex: seconds });
      }
    } catch (error: any) {
      logger.warn("KV Expire Error:", {
        key: key.substring(0, 50),
        error: error?.message || String(error),
      });
    }
  },

  /**
   * Pipeline operations (simplified - executes sequentially)
   */
  pipeline() {
    const commands: Array<() => Promise<any>> = [];
    
    return {
      incr(key: string) {
        commands.push(() => redis.incr(key));
        return this;
      },
      expire(key: string, seconds: number) {
        commands.push(() => redis.expire(key, seconds));
        return this;
      },
      async exec() {
        // Execute commands sequentially
        const results = [];
        for (const cmd of commands) {
          try {
            const result = await cmd();
            results.push([null, result]);
          } catch (error) {
            results.push([error, null]);
          }
        }
        return results;
      },
    };
  },

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!isKVConfigured()) {
      return [];
    }

    try {
      // Vercel KV doesn't support KEYS command directly
      // This is a limitation - we'll return empty array
      // For production, consider using a different key structure
      logger.warn("KV Keys operation not fully supported - returning empty array");
      return [];
    } catch (error: any) {
      logger.warn("KV Keys Error:", {
        pattern,
        error: error?.message || String(error),
      });
      return [];
    }
  },

  /**
   * Status check (always returns "ready" for Vercel KV)
   */
  get status(): string {
    return isKVConfigured() ? "ready" : "end";
  },

  /**
   * Connect (no-op for Vercel KV)
   */
  async connect(): Promise<void> {
    // No-op for Vercel KV
  },

  /**
   * Ping (no-op for Vercel KV)
   */
  async ping(): Promise<string> {
    if (!isKVConfigured()) {
      throw new Error("KV not configured");
    }
    return "PONG";
  },
};

// Log KV status on initialization
if (process.env.NODE_ENV === "development") {
  if (isKVConfigured()) {
    logger.info("Vercel KV configured and ready");
  } else {
    logger.debug("Vercel KV not configured - using graceful degradation");
  }
}
