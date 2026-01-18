import Redis from "ioredis";
import { logger } from "./logger";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null, // Don't retry on connection failure
  });

redis.on("error", (err) => {
  // Log connection errors only in development, silently fail in production
  if (process.env.NODE_ENV === "development") {
    logger.debug("Redis Connection Error (non-critical):", {
      message: err.message,
      note: "Cache and rate limiting will work without Redis, but may be less efficient",
    });
  }
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("ready", () => {
  logger.info("Redis ready for operations");
});

// Attempt to connect on initialization (non-blocking)
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  
  // Try to connect in background (non-blocking)
  redis.connect().catch(() => {
    // Silent - connection will be attempted when first used
    if (process.env.NODE_ENV === "development") {
      logger.debug("Redis not available - will use graceful degradation");
    }
  });
}
