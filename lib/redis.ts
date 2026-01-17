import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

redis.on("error", (err) => {
  // Silent error to prevent terminal spam, but logged for debugging
  if (process.env.NODE_ENV === "development") {
    console.warn("Redis Connection Error:", err.message);
  }
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
