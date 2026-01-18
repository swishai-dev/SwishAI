/**
 * ============================================
 * GEMINI API CONFIGURATION
 * ============================================
 * 
 * Environment Variables:
 * - GEMINI_API_KEY: Your Gemini API key (required)
 * - GEMINI_API_TIER: "free" | "tier1" | "tier2" (default: "free")
 * - GEMINI_MODEL: Model to use (default: "gemini-2.0-flash")
 * 
 * Available Models:
 * - gemini-2.0-flash (fastest, recommended for free tier)
 * - gemini-2.0-flash-lite (lighter, higher limits)
 * - gemini-2.5-flash (newest, better quality)
 * - gemini-2.5-pro (best quality, lower limits)
 * 
 * How to get API Key:
 * 1. Go to https://aistudio.google.com/apikey
 * 2. Sign in with Google account
 * 3. Click "Create API Key"
 * 4. Copy the key and add to .env as GEMINI_API_KEY
 * 
 * To upgrade tier (higher limits):
 * 1. Go to Google Cloud Console
 * 2. Enable billing for your project
 * 3. Set GEMINI_API_TIER=tier1 in .env
 */

// ============================================
// TIER CONFIGURATION
// ============================================

export type GeminiTier = "free" | "tier1" | "tier2";

export interface GeminiLimits {
  rpm: number; // Requests per minute
  rpd: number; // Requests per day
  tpm: number; // Tokens per minute
}

export const GEMINI_TIER_CONFIG: Record<GeminiTier, GeminiLimits> = {
  free: {
    rpm: 15,
    rpd: 200,
    tpm: 1000000,
  },
  tier1: {
    rpm: 60,
    rpd: 1500,
    tpm: 1000000,
  },
  tier2: {
    rpm: 360,
    rpd: 10000,
    tpm: 1000000,
  },
};

// ============================================
// MODEL CONFIGURATION
// ============================================

export type GeminiModel = 
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-pro";

export interface ModelConfig {
  name: GeminiModel;
  description: string;
  freeTierSupported: boolean;
  quality: "fast" | "balanced" | "best";
}

export const GEMINI_MODELS: Record<GeminiModel, ModelConfig> = {
  "gemini-2.0-flash": {
    name: "gemini-2.0-flash",
    description: "Fast and efficient, good for most tasks",
    freeTierSupported: true,
    quality: "fast",
  },
  "gemini-2.0-flash-lite": {
    name: "gemini-2.0-flash-lite",
    description: "Lighter model with higher rate limits",
    freeTierSupported: true,
    quality: "fast",
  },
  "gemini-2.5-flash": {
    name: "gemini-2.5-flash",
    description: "Newest flash model with improved quality",
    freeTierSupported: true,
    quality: "balanced",
  },
  "gemini-2.5-pro": {
    name: "gemini-2.5-pro",
    description: "Best quality, lower rate limits",
    freeTierSupported: true,
    quality: "best",
  },
};

// ============================================
// CONFIGURATION GETTERS
// ============================================

export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

export function getGeminiTier(): GeminiTier {
  const tier = (process.env.GEMINI_API_TIER || "free").toLowerCase() as GeminiTier;
  return tier in GEMINI_TIER_CONFIG ? tier : "free";
}

export function getGeminiModel(): GeminiModel {
  const model = process.env.GEMINI_MODEL as GeminiModel;
  return model && model in GEMINI_MODELS ? model : "gemini-2.0-flash";
}

export function getGeminiLimits(): GeminiLimits {
  return GEMINI_TIER_CONFIG[getGeminiTier()];
}

export function getModelConfig(): ModelConfig {
  return GEMINI_MODELS[getGeminiModel()];
}

// ============================================
// CONFIGURATION SUMMARY (for debugging)
// ============================================

export function getGeminiConfigSummary() {
  return {
    apiKeyConfigured: !!getGeminiApiKey(),
    tier: getGeminiTier(),
    model: getGeminiModel(),
    limits: getGeminiLimits(),
    modelConfig: getModelConfig(),
  };
}
