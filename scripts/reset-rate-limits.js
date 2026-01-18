/**
 * Script to reset rate limit counters in Redis
 * Run with: node scripts/reset-rate-limits.js
 * 
 * This is useful if you've upgraded from free to tier1
 * and want to clear old rate limit data
 */

require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function resetRateLimits() {
  try {
    console.log('🔄 Resetting Gemini rate limit counters...\n');
    
    // Get all rate limit keys
    const keys = await redis.keys('gemini:rate_limit:*');
    
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
    
    console.log('💡 Your tier is now:', process.env.GEMINI_API_TIER || 'free');
    console.log('   Tier1 limits: 60 RPM, 1500 RPD\n');
    
    await redis.quit();
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️  Redis is not running or not accessible');
      console.log('   Rate limits are stored in Redis, but app will work without it\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

resetRateLimits();
