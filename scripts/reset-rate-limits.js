/**
 * Script to reset rate limit counters in Vercel KV
 * Run with: node scripts/reset-rate-limits.js
 * 
 * Note: Vercel KV doesn't support KEYS command, so this script
 * requires manual key specification or a different approach.
 * 
 * For Vercel KV, consider using a prefix-based approach or
 * maintaining a list of active keys separately.
 */

require('dotenv').config();

// Check if using Vercel KV
const isVercelKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

if (isVercelKV) {
  console.log('📦 Using Vercel KV');
  console.log('⚠️  Vercel KV doesn\'t support KEYS command');
  console.log('💡 To reset rate limits, manually delete keys with pattern: openai:rate_limit:*\n');
  console.log('   You can do this via Vercel Dashboard → Storage → KV → Browse keys\n');
  console.log('   Or use Vercel CLI: vercel kv keys list\n');
} else {
  // Fallback to ioredis if REDIS_URL is provided
  const Redis = require('ioredis');
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  async function resetRateLimits() {
    try {
      console.log('🔄 Resetting OpenAI rate limit counters...\n');
      
      // Get all rate limit keys
      const keys = await redis.keys('openai:rate_limit:*');
      
      if (keys.length === 0) {
        console.log('✅ No rate limit keys found. Nothing to reset.\n');
        await redis.quit();
        return;
      }
      
      console.log(`Found ${keys.length} rate limit keys:`);
      keys.forEach(key => console.log(`  - ${key}`));
      console.log('');
      
      // Delete all rate limit keys
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log('✅ All rate limit counters have been reset!\n');
      }
      
      await redis.quit();
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('⚠️  Redis is not running or not accessible');
        console.log('   Rate limits are stored in Redis/KV, but app will work without it\n');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }

  resetRateLimits();
}
