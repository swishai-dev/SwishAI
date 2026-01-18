/**
 * Script to check Gemini API status and quota
 * Run with: node scripts/check-gemini-status.js
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔍 Checking Gemini API Status...\n');
console.log(`API Key: ${apiKey.substring(0, 20)}...`);
console.log(`Model: ${model}\n`);

const genAI = new GoogleGenerativeAI(apiKey);
const modelInstance = genAI.getGenerativeModel({ model });

async function checkStatus() {
  try {
    console.log('📡 Testing API connection...');
    const result = await modelInstance.generateContent('Say "OK" if you can read this.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API is working!');
    console.log(`Response: ${text}\n`);
    console.log('💡 If you\'re getting "quota exceeded" errors, it means:');
    console.log('   - Free tier daily limit (200 requests/day) has been reached');
    console.log('   - This might be from previous usage of the API key');
    console.log('   - Limit resets at midnight Pacific Time');
    console.log('   - Solution: Wait for reset OR upgrade to tier1\n');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    
    if (error.message.includes('quota') || error.message.includes('limit: 0')) {
      console.log('\n⚠️  QUOTA EXCEEDED');
      console.log('   Your API key has reached the daily limit (200 requests/day)');
      console.log('   This might be from previous usage before you started using this app');
      console.log('   Solutions:');
      console.log('   1. Wait until midnight Pacific Time for reset');
      console.log('   2. Upgrade to tier1 in Google Cloud Console');
      console.log('   3. Create a new API key (if allowed)\n');
    } else if (error.message.includes('API_KEY')) {
      console.log('\n⚠️  INVALID API KEY');
      console.log('   Check your GEMINI_API_KEY in .env file\n');
    } else {
      console.log('\n⚠️  UNKNOWN ERROR');
      console.log('   Check the error message above\n');
    }
  }
}

checkStatus();
