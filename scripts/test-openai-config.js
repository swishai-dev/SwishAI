/**
 * Test script to verify OpenAI API key and model configuration
 */

require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAIConfig() {
  console.log('🔍 Testing OpenAI Configuration...\n');

  // Check API Key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
    process.exit(1);
  }

  // Check API Key format
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ ERROR: OPENAI_API_KEY format is invalid (should start with "sk-")');
    console.log(`   Found: ${apiKey.substring(0, 10)}...`);
    process.exit(1);
  }

  console.log('✅ API Key found and format is valid');
  console.log(`   Key prefix: ${apiKey.substring(0, 15)}...`);

  // Check Model
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  
  if (!validModels.includes(model)) {
    console.error(`❌ ERROR: Invalid OPENAI_MODEL: ${model}`);
    console.log(`   Valid models: ${validModels.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Model configured: ${model}`);

  // Test API connection
  console.log('\n🧪 Testing API connection...');
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Say "API test successful" if you can read this.',
        },
      ],
      max_tokens: 20,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('✅ API connection successful!');
    console.log(`   Response: ${response}`);
    console.log(`   Model used: ${completion.model}`);
    console.log(`   Tokens used: ${completion.usage?.total_tokens || 'N/A'}`);

    // Model info
    console.log('\n📊 Model Information:');
    const modelConfigs = {
      'gpt-4o': { quality: 'Best', cost: '$2.50/$10.00 per 1M tokens' },
      'gpt-4o-mini': { quality: 'Fast', cost: '$0.15/$0.60 per 1M tokens' },
      'gpt-4-turbo': { quality: 'Best', cost: '$10.00/$30.00 per 1M tokens' },
      'gpt-3.5-turbo': { quality: 'Fast', cost: '$0.50/$1.50 per 1M tokens' },
    };

    const info = modelConfigs[model];
    if (info) {
      console.log(`   Quality: ${info.quality}`);
      console.log(`   Cost: ${info.cost}`);
    }

    console.log('\n✅ All checks passed! Your OpenAI configuration is ready to use.');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    if (error.status === 401) {
      console.error('   Invalid API key. Please check your OPENAI_API_KEY in .env file.');
    } else if (error.status === 429) {
      console.error('   Rate limit exceeded. Please wait a moment and try again.');
    } else if (error.status === 404) {
      console.error(`   Model "${model}" not found or not available.`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testOpenAIConfig().catch(console.error);
