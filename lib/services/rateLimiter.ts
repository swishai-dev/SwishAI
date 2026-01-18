import { redis } from "../redis";
import { logger } from "../logger";
import { getOpenAILimits } from "../config/openai";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds to wait before retry
  tier?: string;
  redisAvailable?: boolean;
}

/**
 * Check if Redis is available and connected
 * Waits briefly for connection if Redis is connecting
 */
async function isRedisAvailable(): Promise<boolean> {
  try {
    const status = redis.status;
    
    // If already ready, return true immediately
    if (status === "ready") return true;
    
    // If connecting, wait a bit and try to ping
    if (status === "connect" || status === "connecting") {
      try {
        // Wait up to 500ms for connection
        const pingPromise = redis.ping();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 500)
        );
        await Promise.race([pingPromise, timeoutPromise]);
        return true;
      } catch (error) {
        // Connection still in progress or failed
        return false;
      }
    }
    
    // If not connected, try to connect (non-blocking)
    if (status === "end" || status === "close") {
      try {
        await redis.connect();
        // Give it a moment to establish connection
        await new Promise(resolve => setTimeout(resolve, 100));
        if (redis.status === "ready") return true;
      } catch (error) {
        // Connection failed
        return false;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

export class RateLimiter {
  private static redisAvailabilityCache: { available: boolean; timestamp: number } | null = null;
  private static readonly CACHE_TTL = 5000; // Cache availability check for 5 seconds

  /**
   * Rate limit check for OpenAI API calls
   * Uses limits from configuration
   * Falls back gracefully if Redis is unavailable
   */
  static async checkOpenAIRateLimit(): Promise<RateLimitResult> {
    const limits = getOpenAILimits();
    const provider = "OpenAI";
    const now = Math.floor(Date.now() / 1000);
    const minuteWindow = Math.floor(now / 60);

    const minuteKey = `openai:rate_limit:minute:${minuteWindow}`;

    // Check cached availability first (to avoid excessive checks)
    const cacheAge = this.redisAvailabilityCache 
      ? Date.now() - this.redisAvailabilityCache.timestamp 
      : Infinity;
    
    let redisAvailable: boolean;
    if (this.redisAvailabilityCache && cacheAge < this.CACHE_TTL) {
      redisAvailable = this.redisAvailabilityCache.available;
    } else {
      // Check Redis availability
      redisAvailable = await isRedisAvailable();
      // Cache the result
      this.redisAvailabilityCache = {
        available: redisAvailable,
        timestamp: Date.now(),
      };
    }
    
    if (!redisAvailable) {
      // Only log once per cache period to avoid spam
      if (!this.redisAvailabilityCache || cacheAge >= this.CACHE_TTL) {
        logger.debug("Redis not available, skipping rate limit check", {
          provider,
          note: "Rate limiting disabled - API calls will proceed",
        });
      }
      // If Redis is not available, allow requests but warn
      // The API itself will enforce limits
      return {
        allowed: true,
        remaining: limits.rpm, // Estimate
        resetAt: now + 60,
        tier: provider,
        redisAvailable: false,
      };
    }

    try {
      // Check minute limit (OpenAI only has RPM limits, no daily limits)
      const minuteCount = await redis.get(minuteKey);
      const minuteLimit = limits.rpm;
      
      if (minuteCount && parseInt(minuteCount) >= minuteLimit) {
        const resetAt = (minuteWindow + 1) * 60;
        const retryAfter = resetAt - now;
        
        logger.warn("OpenAI API rate limit exceeded (per minute)", {
          current: minuteCount,
          limit: minuteLimit,
          retryAfter,
          provider,
        });

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter,
          tier: provider,
          redisAvailable: true,
        };
      }

      // Increment counter
      const pipeline = redis.pipeline();
      pipeline.incr(minuteKey);
      pipeline.expire(minuteKey, 120); // Expire after 2 minutes
      await pipeline.exec();

      const remainingMinute = minuteLimit - (parseInt(minuteCount || "0") + 1);

      return {
        allowed: true,
        remaining: remainingMinute,
        resetAt: (minuteWindow + 1) * 60,
        tier: provider,
        redisAvailable: true,
      };
    } catch (error: any) {
      logger.error("Rate limiter error", {
        error: error?.message || error,
        provider,
      });
      // If Redis fails during operation, allow the request but log the error
      // The API itself will enforce limits
      return {
        allowed: true,
        remaining: limits.rpm, // Estimate
        resetAt: now + 60,
        tier: provider,
        redisAvailable: false,
      };
    }
  }

  /**
   * Legacy method for Gemini (kept for backward compatibility)
   * @deprecated Use checkOpenAIRateLimit instead
   */
  static async checkGeminiRateLimit(): Promise<RateLimitResult> {
    return this.checkOpenAIRateLimit();
  }

  /**
   * Extract retry-after from error message or use default
   */
  static extractRetryAfter(error: any): number {
    if (error?.message?.includes("Please retry in")) {
      const match = error.message.match(/Please retry in ([\d.]+)s/);
      if (match) {
        return Math.ceil(parseFloat(match[1]));
      }
    }
    return 60; // Default 60 seconds
  }
}
