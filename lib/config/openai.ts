/**
 * ============================================
 * OPENAI API CONFIGURATION
 * ============================================
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: Your OpenAI API key (required)
 * - OPENAI_MODEL: Model to use (default: "gpt-4o")
 * 
 * Available Models:
 * - gpt-4o (best quality/price balance, recommended for analysis)
 * - gpt-4o-mini (fastest, cheapest, good for simple tasks)
 * - gpt-4-turbo (highest quality, most expensive)
 * - gpt-3.5-turbo (fastest, cheapest, lower quality)
 * 
 * How to get API Key:
 * 1. Go to https://platform.openai.com/api-keys
 * 2. Sign in with OpenAI account
 * 3. Click "Create new secret key"
 * 4. Copy the key and add to .env as OPENAI_API_KEY
 * 
 * Rate Limits:
 * - Free tier: Very limited
 * - Pay-as-you-go: Based on usage
 * - No daily limits, only RPM/TPM limits
 */

// ============================================
// MODEL CONFIGURATION
// ============================================

export type OpenAIModel = 
  | "gpt-4o-mini"
  | "gpt-4o"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo";

export interface ModelConfig {
  name: OpenAIModel;
  description: string;
  quality: "fast" | "balanced" | "best";
  costPer1kTokens: number; // Approximate cost in USD
}

export const OPENAI_MODELS: Record<OpenAIModel, ModelConfig> = {
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    description: "Fast and efficient, best value for money",
    quality: "fast",
    costPer1kTokens: 0.15, // $0.15/$0.60 per 1M tokens
  },
  "gpt-4o": {
    name: "gpt-4o",
    description: "Best quality, optimized for speed",
    quality: "best",
    costPer1kTokens: 2.50, // $2.50/$10.00 per 1M tokens
  },
  "gpt-4-turbo": {
    name: "gpt-4-turbo",
    description: "High quality, good for complex tasks",
    quality: "best",
    costPer1kTokens: 10.00, // $10/$30 per 1M tokens
  },
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    description: "Fastest and cheapest, lower quality",
    quality: "fast",
    costPer1kTokens: 0.50, // $0.50/$1.50 per 1M tokens
  },
};

// ============================================
// RATE LIMITS (approximate)
// ============================================

export interface OpenAILimits {
  rpm: number; // Requests per minute
  tpm: number; // Tokens per minute
}

// Rate limits vary by tier, these are conservative estimates
export const OPENAI_RATE_LIMITS: Record<string, OpenAILimits> = {
  free: {
    rpm: 3,
    tpm: 40000,
  },
  tier1: {
    rpm: 60,
    tpm: 1000000,
  },
  tier2: {
    rpm: 500,
    tpm: 10000000,
  },
};

// ============================================
// CONFIGURATION GETTERS
// ============================================

export function getOpenAIApiKey(): string {
  return process.env.OPENAI_API_KEY || "";
}

export function getOpenAIModel(): OpenAIModel {
  const model = process.env.OPENAI_MODEL as OpenAIModel;
  return model && model in OPENAI_MODELS ? model : "gpt-4o";
}

export function getModelConfig(): ModelConfig {
  return OPENAI_MODELS[getOpenAIModel()];
}

export function getOpenAILimits(): OpenAILimits {
  // OpenAI doesn't have explicit tiers like Gemini
  // Use tier1 limits as default (conservative)
  return OPENAI_RATE_LIMITS.tier1;
}

// ============================================
// CONFIGURATION SUMMARY (for debugging)
// ============================================

export function getOpenAIConfigSummary() {
  return {
    apiKeyConfigured: !!getOpenAIApiKey(),
    model: getOpenAIModel(),
    modelConfig: getModelConfig(),
    limits: getOpenAILimits(),
  };
}
