import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RateLimiter } from "@/lib/services/rateLimiter";
import { CacheService } from "@/lib/services/cache";
import { logger } from "@/lib/logger";
import { 
  getOpenAIApiKey,
  getOpenAIModel,
  getModelConfig,
  getOpenAILimits,
  getOpenAIConfigSummary 
} from "@/lib/config/openai";

// Initialize OpenAI with config
const openai = new OpenAI({
  apiKey: getOpenAIApiKey(),
});

const currentModel = getOpenAIModel();
const currentModelConfig = getModelConfig();
const currentLimits = getOpenAILimits();

/**
 * Retry function with exponential backoff
 * Does NOT retry on quota exceeded errors (limit reached)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";
      
      // Check if it's a rate limit error (429)
      const isRateLimit = error?.status === 429 || 
                         errorMessage.includes("rate_limit") ||
                         errorMessage.includes("429");
      
      // Check if it's a quota/billing error (don't retry)
      const isQuotaError = errorMessage.includes("quota") || 
                          errorMessage.includes("billing") ||
                          errorMessage.includes("insufficient_quota");
      
      // If quota/billing error, don't retry - throw immediately
      if (isQuotaError) {
        logger.warn("Quota/billing error - not retrying", {
          attempt: attempt + 1,
          error: errorMessage.substring(0, 200),
        });
        throw error;
      }
      
      // If it's a rate limit, retry with backoff
      if (isRateLimit && attempt < maxRetries - 1) {
        const retryAfter = error?.headers?.["retry-after"] || 60;
        const delay = Math.min(baseDelay * Math.pow(2, attempt), parseInt(retryAfter.toString()) * 1000);
        
        logger.warn(`Rate limit hit, retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Generate fallback analysis when API is unavailable
 */
function generateFallbackAnalysis(
  type: string, 
  data: any, 
  retryAfter?: number,
  model?: string
): string {
  const retryInfo = retryAfter 
    ? `${Math.ceil(retryAfter / 60)} minutes`
    : `automatically`;
  
  const modelInfo = model ? ` (${model})` : "";
  
  if (type === "game") {
    return `## Analysis Temporarily Unavailable

OpenAI API rate limit has been reached. Real-time analysis will resume shortly.

## Retry Information

Rate limit will reset ${retryInfo}. Please try again later.

## Model Information

Using OpenAI${modelInfo} for analysis generation.`;
  } else {
    return `## Analysis Temporarily Unavailable

OpenAI API rate limit has been reached. Real-time analysis will resume shortly.

## Retry Information

Rate limit will reset ${retryInfo}. Please try again later.

## Model Information

Using OpenAI${modelInfo} for analysis generation.`;
  }
}

export async function POST(request: NextRequest) {
  // Parse request body once at the start
  let body: any;
  let type: string = "game";
  let data: any = {};

  try {
    body = await request.json();
    type = body.type || "game";
    data = body.data || {};
  } catch (parseError) {
    return NextResponse.json(
      { 
        error: "Invalid request body",
        fallback: generateFallbackAnalysis("game", {}),
      },
      { status: 400 }
    );
  }

  try {
    if (!getOpenAIApiKey()) {
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          fallback: generateFallbackAnalysis(type, data, undefined, currentModel),
        },
        { status: 500 }
      );
    }

    // Optional: Check rate limit before making API call (only if Redis is available)
    // OpenAI doesn't have strict daily limits, so we mainly check RPM
    const rateLimitCheck = await RateLimiter.checkOpenAIRateLimit();
    
    // Only block if Redis is available AND rate limit is exceeded
    if (rateLimitCheck.redisAvailable && !rateLimitCheck.allowed) {
      logger.warn("Request blocked by rate limiter", {
        retryAfter: rateLimitCheck.retryAfter,
        resetAt: new Date(rateLimitCheck.resetAt * 1000).toISOString(),
      });
      
      return NextResponse.json(
        {
          error: "API rate limit exceeded",
          message: `OpenAI rate limit reached (${currentLimits.rpm} requests/minute). Please try again in ${Math.ceil((rateLimitCheck.retryAfter || 60) / 60)} minutes.`,
          retryAfter: rateLimitCheck.retryAfter,
          resetAt: rateLimitCheck.resetAt,
          fallback: generateFallbackAnalysis(type, data, rateLimitCheck.retryAfter, currentModel),
          model: currentModel,
          provider: "OpenAI",
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitCheck.retryAfter?.toString() || "60",
          },
        }
      );
    }

    // Generate cache key based on request data
    const cacheKey = `openai:analysis:${type}:${JSON.stringify(data).substring(0, 100)}`;
    
    // Try to get from cache first
    const cached = await CacheService.get<string>(cacheKey);
    if (cached) {
      logger.debug("Returning cached analysis", { cacheKey });
      
      // Parse cached response to extract markdown and JSON
      let cachedMarkdown = cached;
      let cachedStructuredData = null;
      
      const jsonMatch = cached.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          cachedStructuredData = JSON.parse(jsonMatch[1]);
          cachedMarkdown = cached.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
        } catch (parseError) {
          logger.warn("Failed to parse JSON from cached analysis", { error: parseError });
        }
      }
      
      return NextResponse.json({ 
        analysis: cachedMarkdown, 
        structuredData: cachedStructuredData,
        rawResponse: cached,
        cached: true, 
        model: currentModel, 
        provider: "OpenAI" 
      });
    }

    let prompt = "";

    if (type === "game") {
      const moneylineAway = data.moneyline ? Math.round(data.moneyline.away.price * 100) : null;
      const moneylineHome = data.moneyline ? Math.round(data.moneyline.home.price * 100) : null;
      const spreadLine = data.spread?.line || null;
      const spreadHome = data.spread ? Math.round(data.spread.home * 100) : null;
      const spreadAway = data.spread ? Math.round(data.spread.away * 100) : null;
      const totalLine = data.total?.line || null;
      const totalOver = data.total ? Math.round(data.total.over * 100) : null;
      const totalUnder = data.total ? Math.round(data.total.under * 100) : null;

      prompt = `You are a senior sports analytics AI architect and NBA betting analyst with deep expertise in statistical modeling, market dynamics, and actionable betting intelligence.

Your task is to analyze this NBA game and provide production-ready analytical market commentary that helps bettors make informed decisions.

GAME CONTEXT:
- Matchup: ${data.awayTeam} @ ${data.homeTeam}
- Start Time: ${data.startTime}
- Volume Traded: $${data.volume?.toLocaleString() || "N/A"}

CURRENT MARKET LINES:
- Moneyline: ${data.moneyline ? `${data.awayTeam} ${moneylineAway}¢ / ${data.homeTeam} ${moneylineHome}¢` : "N/A"}
- Spread: ${data.spread ? `${data.homeTeam} ${spreadLine} (Home ${spreadHome}¢ / Away ${spreadAway}¢)` : "N/A"}
- Total: ${data.total ? `O/U ${totalLine} (Over ${totalOver}¢ / Under ${totalUnder}¢)` : "N/A"}

ANALYTICAL FRAMEWORK - ANALYZE THESE CRITICAL FACTORS:

1. RECENT FORM & MOMENTUM:
   - Last 5-10 games performance for both teams
   - Win/loss streaks and momentum shifts
   - Recent scoring trends (points per game, offensive efficiency)
   - Defensive performance trends (points allowed, defensive rating)
   - Quality of opponents faced recently

2. HOME/AWAY SPLITS:
   - Home team's home record and performance metrics
   - Away team's road record and performance metrics
   - Home court advantage significance for this matchup
   - Travel factors (back-to-back games, rest days, time zone changes)

3. HEAD-TO-HEAD HISTORY:
   - Recent meetings between these teams (last 2-3 seasons)
   - Scoring patterns in previous matchups
   - Which team has dominated historically
   - Style of play in head-to-head games

4. PACE & STYLE ANALYSIS:
   - Each team's pace of play (possessions per game)
   - Fast break tendencies
   - Half-court vs transition offense preferences
   - Defensive tempo and pressure application
   - How these styles match up against each other

5. KEY MATCHUPS & ROTATIONS:
   - Star player matchups and who has the advantage
   - Bench depth and second unit performance
   - Coaching strategies and adjustments
   - Potential lineup changes or rotations

6. INJURY & ROSTER IMPACT:
   - Key player availability and injury status
   - Impact of missing players on team performance
   - Depth chart adjustments and their effects
   - Minutes distribution changes

7. MARKET EFFICIENCY & VALUE:
   - Whether the line seems sharp or soft
   - Public betting sentiment vs sharp money indicators
   - Line movement analysis (if available)
   - Market overreactions or underreactions
   - Where the value actually lies

8. CONTEXTUAL FACTORS:
   - Playoff positioning and motivation levels
   - Rivalry intensity
   - Rest vs fatigue factors
   - Schedule difficulty (tough stretch vs easy stretch)
   - National TV game implications

9. STATISTICAL EDGES:
   - Offensive efficiency rankings and matchups
   - Defensive efficiency rankings and matchups
   - Rebounding advantages/disadvantages
   - Turnover rates and ball security
   - Three-point shooting volume and accuracy
   - Free throw rates and conversion

10. GAME FLOW PREDICTIONS:
    - Likely game script (blowout risk vs close game)
    - Pace implications for totals
    - Which team controls tempo
    - Late-game execution factors

REQUIRED OUTPUT FORMAT:

You MUST respond in TWO PARTS ONLY:

---

## PART 1 — MARKDOWN ANALYSIS

Use these sections EXACTLY in this order (NO emojis, NO hype language, NO guarantees):

### Game Context & Stakes
Provide context about the matchup significance, recent form of both teams, and what's at stake. Include playoff implications, rivalry factors, or motivation levels if relevant. Reference recent performance trends (last 5-10 games) and momentum. (2-3 sentences max)

### Statistical Matchup Breakdown
Analyze pace, offensive/defensive efficiency, scoring profiles, and defensive tendencies. Compare both teams to league averages. Include specific metrics like points per game, offensive/defensive ratings, pace of play, and how these match up. Reference head-to-head history if relevant. (2-3 sentences max)

### Home/Away Dynamics & Recent Form
Break down home court advantage significance, road performance, rest factors, and recent form trends. Compare home team's home record vs away team's road record. Discuss any back-to-back games, travel factors, or rest advantages. Include recent scoring trends and defensive performance. (2-3 sentences max)

### Key Matchups & Tactical Factors
Identify critical player matchups, coaching strategies, lineup advantages, and style of play conflicts. Discuss which team controls tempo, bench depth impact, and potential game-changing matchups. Include rotation patterns and how teams might adjust. (2-3 sentences max)

### Market & Line Analysis
Analyze where the current line implies probability and whether the market seems efficient or mispriced. Discuss line movement if relevant, public vs sharp money, and market sentiment. Evaluate if the line is sharp or soft based on statistical expectations. (2-3 sentences max)

### Value Identification & Edge
Identify specific mispricing or asymmetric risk opportunities. Explain WHY value exists based on statistical analysis, matchup advantages, or market inefficiencies. Reference concrete factors like pace mismatches, defensive weaknesses, or market overreactions. Be specific about which bet offers the best value. (2-3 sentences max)

### Risk & Volatility Factors
Highlight key risks: injury uncertainty, variance factors, pace swings, blowout potential, and game script risks. Discuss what could go wrong with your analysis. Include factors like three-point variance, free throw rates, turnover-prone matchups, or late-game execution concerns. (2-3 sentences max)

---

## PART 2 — STRUCTURED DATA (JSON ONLY)

After the markdown, include a VALID JSON block with this EXACT schema:

\`\`\`json
{
  "confidence": 0-100,
  "edgeScore": 0-10,
  "marketBias": "overpriced_favorite | underpriced_underdog | efficient | unclear",
  "recommendedSide": "home | away | over | under | none",
  "recommendationReason": "Clear 1-2 sentence explanation of why this specific recommendation is made, referencing the strongest supporting factor",
  "keyFactors": [
    { "label": "Recent Form", "impact": -5 to +5 },
    { "label": "Home/Away Advantage", "impact": -5 to +5 },
    { "label": "Pace & Tempo", "impact": -5 to +5 },
    { "label": "Offensive Efficiency", "impact": -5 to +5 },
    { "label": "Defensive Matchup", "impact": -5 to +5 },
    { "label": "Key Matchups", "impact": -5 to +5 },
    { "label": "Market Value", "impact": -5 to +5 },
    { "label": "Risk Factors", "impact": -5 to +5 }
  ],
  "charts": {
    "probabilityComparison": {
      "modelProbability": number (0-100),
      "marketImpliedProbability": number (0-100)
    },
    "riskDistribution": [
      { "factor": "Injury Uncertainty", "weight": number (0-100) },
      { "factor": "Pace Variance", "weight": number (0-100) },
      { "factor": "Blowout Risk", "weight": number (0-100) },
      { "factor": "Three-Point Variance", "weight": number (0-100) },
      { "factor": "Late-Game Execution", "weight": number (0-100) }
    ]
  }
}
\`\`\`

CRITICAL REQUIREMENTS:
- Each markdown section MUST be max 2-3 sentences.
- NO emojis in markdown sections.
- NO hype language or guarantees.
- JSON MUST be valid and parseable - use proper JSON syntax with double quotes, no trailing commas, valid number types.
- All numbers in JSON must be within specified ranges (use integers for confidence, edgeScore, impact, weight; use numbers for probabilities).
- "recommendedSide" MUST be one of: "home", "away", "over", "under", or "none"
- "recommendationReason" MUST provide a clear, specific explanation of why this recommendation is made
- If "recommendedSide" is "none", explain why no clear recommendation exists
- IMPORTANT: The JSON block MUST be wrapped in triple backticks with "json" language tag: \`\`\`json ... \`\`\`
- IMPORTANT: Ensure all JSON strings are properly escaped and all brackets/braces are balanced
- This is analytical market commentary, NOT gambling advice.`;
    } else if (type === "prop") {
      const outcomesList = data.outcomes?.map((o: any, i: number) => `${i + 1}. ${o.name}: ${Math.round(o.price * 100)}%`).join("\n") || "N/A";
      const marketType = data.question?.toLowerCase().includes("player") ? "player prop" : 
                        data.question?.toLowerCase().includes("team") ? "team prop" : 
                        data.question?.toLowerCase().includes("season") ? "season-long futures" : "market prop";

      prompt = `You are a senior sports analytics AI architect specializing in NBA futures, props, and prediction markets with expertise in player performance analysis, team dynamics, and market efficiency.

Your task is to analyze this NBA ${marketType} market and provide production-ready analytical market commentary with deep statistical and narrative insights that help bettors make informed decisions.

MARKET CONTEXT:
- Market Question: ${data.question}
- Market Type: ${marketType}
- Total Volume Traded: $${data.volume?.toLocaleString() || "N/A"}
- Number of Options: ${data.outcomes?.length || 0}

AVAILABLE MARKET OPTIONS:
${outcomesList}

ANALYTICAL FRAMEWORK - ANALYZE THESE CRITICAL FACTORS:

1. HISTORICAL PERFORMANCE & BASELINES:
   - Career averages and recent season trends
   - Performance patterns and consistency metrics
   - Statistical baselines for this market type
   - Regression to mean considerations

2. CURRENT SEASON CONTEXT:
   - Current season performance vs historical averages
   - Recent form trends (last 10-20 games for player props, recent games for team props)
   - Usage rates, minutes distribution, and role changes
   - Team context (playoff race, motivation, coaching changes)

3. MATCHUP & OPPONENT ANALYSIS:
   - Opponent defensive rankings relevant to this market
   - Head-to-head performance history
   - Pace factors and game script implications
   - Defensive schemes and how they affect this market

4. MARKET EFFICIENCY & PRICING:
   - Whether current prices reflect statistical expectations
   - Market overreactions or underreactions to recent events
   - Sharp money indicators vs public sentiment
   - Pricing discrepancies and value opportunities

5. VOLUME FLOW & TRADER POSITIONING:
   - Where money is flowing and why
   - Volume patterns indicating smart money
   - Sentiment shifts and market dynamics
   - Correlation with other markets

6. RISK & VOLATILITY FACTORS:
   - Variance factors specific to this market type
   - Injury risk and minutes uncertainty
   - Game script risks (blowouts, garbage time)
   - Timing factors and information asymmetry

7. CONTEXTUAL FACTORS:
   - Schedule difficulty and rest factors
   - Playoff implications and motivation
   - Team chemistry and role stability
   - External factors (trades, coaching changes, roster moves)

REQUIRED OUTPUT FORMAT:

You MUST respond in TWO PARTS ONLY:

---

## PART 1 — MARKDOWN ANALYSIS

Use these sections EXACTLY in this order (NO emojis, NO hype language, NO guarantees):

### Market Context & Stakes
Provide context about what this market measures, its significance, and current positioning. Explain why this market matters, what drives interest, and any relevant context (player role, team situation, season stage). Include recent performance trends and momentum factors. (2-3 sentences max)

### Statistical Baseline & Recent Form Analysis
Analyze historical averages, current season performance, and recent form trends. Compare current conditions to historical baselines. For player props, include usage rates, minutes, and recent game-by-game performance. For team props, include recent team performance and trends. Reference specific metrics and identify any significant deviations from norms. (2-3 sentences max)

### Matchup & Opponent Analysis
Analyze how the matchup affects this market. For player props: opponent defensive rankings, head-to-head history, defensive schemes. For team props: opponent strengths/weaknesses, pace factors, style matchups. Discuss how the opponent's style impacts the likelihood of different outcomes. (2-3 sentences max)

### Market Pricing & Efficiency Assessment
Evaluate where the market is pricing each option relative to statistical expectations. Identify which options appear overpriced or underpriced. Discuss market efficiency, recent price movements, and whether the market is reacting appropriately to information. Reference specific pricing discrepancies. (2-3 sentences max)

### Value Identification & Edge Analysis
Identify specific value opportunities with quantitative reasoning. Explain WHY value exists based on statistical analysis, matchup advantages, or market inefficiencies. Reference concrete factors like usage rate changes, opponent weaknesses, or market overreactions. Be specific about which option offers the best edge. (2-3 sentences max)

### Risk & Volatility Factors
Highlight key risks: variance factors, injury/rest uncertainty, game script risks (blowouts, garbage time), minutes distribution concerns, and information asymmetry. Discuss what could cause the market to move against your analysis. Include specific volatility factors relevant to this market type. (2-3 sentences max)

### Market Sentiment & Flow Analysis
Analyze where money is flowing and why. Discuss trader positioning, volume patterns, sentiment shifts, and whether sharp money aligns with public sentiment. Identify if the market is overreacting or underreacting to recent events or news. (2-3 sentences max)

---

## PART 2 — STRUCTURED DATA (JSON ONLY)

After the markdown, include a VALID JSON block with this EXACT schema:

\`\`\`json
{
  "confidence": 0-100,
  "edgeScore": 0-10,
  "marketBias": "overpriced | underpriced | efficient | unclear",
  "recommendedOption": "exact_option_name_from_list | none",
  "recommendationReason": "Clear 1-2 sentence explanation of why this specific option is recommended, referencing the strongest supporting statistical or narrative factor",
  "keyFactors": [
    { "label": "Statistical Edge", "impact": -5 to +5 },
    { "label": "Market Pricing", "impact": -5 to +5 },
    { "label": "Value Opportunity", "impact": -5 to +5 },
    { "label": "Risk Assessment", "impact": -5 to +5 },
    { "label": "Market Sentiment", "impact": -5 to +5 }
  ],
  "charts": {
    "probabilityComparison": {
      "modelProbability": number (0-100),
      "marketImpliedProbability": number (0-100)
    },
    "riskDistribution": [
      { "factor": "Statistical Variance", "weight": number (0-100) },
      { "factor": "Information Asymmetry", "weight": number (0-100) },
      { "factor": "Timing Risk", "weight": number (0-100) },
      { "factor": "Market Volatility", "weight": number (0-100) }
    ]
  }
}
\`\`\`

CRITICAL REQUIREMENTS:
- Each markdown section MUST be max 2-3 sentences.
- NO emojis in markdown sections.
- NO hype language or guarantees.
- JSON MUST be valid and parseable - use proper JSON syntax with double quotes, no trailing commas, valid number types.
- All numbers in JSON must be within specified ranges (use integers for confidence, edgeScore, impact, weight; use numbers for probabilities).
- "recommendedOption" MUST be the EXACT option name from the market list above (case-sensitive), or "none"
- "recommendationReason" MUST provide a clear, specific explanation referencing the strongest supporting factor
- "keyFactors" MUST include all 5 factors listed above with impact scores
- "riskDistribution" MUST include all 4 factors listed above with weights that sum to approximately 100
- If "recommendedOption" is "none", "recommendationReason" must explain why no clear recommendation exists
- "modelProbability" should reflect your statistical assessment, "marketImpliedProbability" should reflect current market pricing
- IMPORTANT: The JSON block MUST be wrapped in triple backticks with "json" language tag: \`\`\`json ... \`\`\`
- IMPORTANT: Ensure all JSON strings are properly escaped and all brackets/braces are balanced
- IMPORTANT: Double-check that the JSON is valid before including it - test it mentally or ensure proper formatting
- This is analytical market commentary, NOT gambling advice.`;
    }

    // Use retry logic for API call
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: currentModel,
        messages: [
          {
            role: "system",
            content: "You are a senior sports analytics AI architect and NBA betting analyst. Provide production-ready analytical market commentary. CRITICAL: Always respond with markdown analysis followed by valid JSON structured data. The JSON MUST be properly formatted and parseable. Use triple backticks with 'json' language tag for the JSON block.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: type === "game" ? 2500 : 2000,
        temperature: 0.2, // Lower temperature for more consistent JSON output
        response_format: undefined, // Don't force JSON mode as we need markdown + JSON
      });
    });

    const text = completion.choices[0]?.message?.content || "Analysis unavailable.";

    // Parse the response to extract markdown and JSON
    let markdownAnalysis = text;
    let structuredData = null;

    /**
     * Robust JSON parsing function with multiple strategies
     */
    function parseJSONFromText(text: string): { json: any; markdown: string } | null {
      // Strategy 1: Try to extract JSON from code blocks (most common)
      const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch) {
        try {
          const jsonText = jsonBlockMatch[1].trim();
          const parsed = JSON.parse(jsonText);
          const markdown = text.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();
          return { json: parsed, markdown };
        } catch (e) {
          logger.warn("Failed to parse JSON from code block", { error: e });
        }
      }

      // Strategy 2: Try to find JSON block without language tag
      const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try {
          const jsonText = codeBlockMatch[1].trim();
          // Check if it looks like JSON
          if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
            const parsed = JSON.parse(jsonText);
            const markdown = text.replace(/```\s*[\s\S]*?\s*```/g, '').trim();
            return { json: parsed, markdown };
          }
        } catch (e) {
          logger.warn("Failed to parse JSON from code block (no tag)", { error: e });
        }
      }

      // Strategy 3: Try to find JSON object at the end of text
      const jsonAtEndMatch = text.match(/\{[\s\S]*\}$/);
      if (jsonAtEndMatch) {
        try {
          const jsonText = jsonAtEndMatch[0];
          const parsed = JSON.parse(jsonText);
          const markdown = text.substring(0, jsonAtEndMatch.index).trim();
          return { json: parsed, markdown };
        } catch (e) {
          logger.warn("Failed to parse JSON from end", { error: e });
        }
      }

      // Strategy 4: Try to find any JSON object in the text (last resort)
      const jsonObjectMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (jsonObjectMatch) {
        try {
          const jsonText = jsonObjectMatch[0];
          const parsed = JSON.parse(jsonText);
          const markdown = text.replace(jsonText, '').trim();
          return { json: parsed, markdown };
        } catch (e) {
          logger.warn("Failed to parse JSON object", { error: e });
        }
      }

      return null;
    }

    // Try to parse JSON
    const parsedResult = parseJSONFromText(text);
    if (parsedResult) {
      structuredData = parsedResult.json;
      markdownAnalysis = parsedResult.markdown;
    }

    // Fallback: Generate default structured data if parsing failed
    if (!structuredData) {
      logger.warn("Failed to parse JSON, using fallback structured data", {
        textLength: text.length,
        textPreview: text.substring(0, 200),
      });

      // Generate fallback structured data based on type
      structuredData = type === "game" ? {
        confidence: 50,
        edgeScore: 5,
        marketBias: "unclear",
        recommendedSide: "none",
        recommendationReason: "Unable to parse structured analysis. Please review the markdown analysis above.",
        keyFactors: [
          { label: "Pace", impact: 0 },
          { label: "Offensive Efficiency", impact: 0 },
          { label: "Defensive Matchup", impact: 0 },
          { label: "Market Sentiment", impact: 0 }
        ],
        charts: {
          probabilityComparison: {
            modelProbability: 50,
            marketImpliedProbability: 50
          },
          riskDistribution: [
            { factor: "Injuries", weight: 33 },
            { factor: "Pace Variance", weight: 33 },
            { factor: "Blowout Risk", weight: 34 }
          ]
        }
      } : {
        confidence: 50,
        edgeScore: 5,
        marketBias: "unclear",
        recommendedOption: "none",
        recommendationReason: "Unable to parse structured analysis. Please review the markdown analysis above.",
        keyFactors: [
          { label: "Statistical Edge", impact: 0 },
          { label: "Market Pricing", impact: 0 },
          { label: "Value Opportunity", impact: 0 },
          { label: "Risk Assessment", impact: 0 },
          { label: "Market Sentiment", impact: 0 }
        ],
        charts: {
          probabilityComparison: {
            modelProbability: 50,
            marketImpliedProbability: 50
          },
          riskDistribution: [
            { factor: "Statistical Variance", weight: 25 },
            { factor: "Information Asymmetry", weight: 25 },
            { factor: "Timing Risk", weight: 25 },
            { factor: "Market Volatility", weight: 25 }
          ]
        }
      };
    }

    // Cache the full response for 5 minutes
    await CacheService.set(cacheKey, text, 300);

    logger.info("Analysis generated successfully", {
      type,
      model: currentModel,
      provider: "OpenAI",
      hasStructuredData: !!structuredData,
      structuredDataKeys: structuredData ? Object.keys(structuredData) : [],
      markdownLength: markdownAnalysis.length,
      usedFallback: !parsedResult && !!structuredData,
    });

    return NextResponse.json({ 
      analysis: markdownAnalysis,
      structuredData: structuredData,
      rawResponse: text,
      model: currentModel,
      provider: "OpenAI",
    });
  } catch (error: any) {
    logger.error("OpenAI API Error", {
      error: error.message,
      stack: error.stack,
    });

    // Check if it's a rate limit error
    const isRateLimit = error?.status === 429 || 
                       error?.message?.includes("rate_limit") ||
                       error?.message?.includes("429");

    if (isRateLimit) {
      const retryAfter = error?.headers?.["retry-after"] || 60;
      
      logger.warn("OpenAI API Rate Limit Exceeded", {
        model: currentModel,
        retryAfter,
        errorMessage: error.message.substring(0, 200),
      });

      return NextResponse.json(
        {
          error: "API rate limit exceeded",
          message: `OpenAI rate limit reached. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfter: parseInt(retryAfter.toString()),
          fallback: generateFallbackAnalysis(type, data, retryAfter, currentModel),
          model: currentModel,
          provider: "OpenAI",
        },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || "Failed to generate analysis",
        fallback: generateFallbackAnalysis(type, data, undefined, currentModel),
        model: currentModel,
        provider: "OpenAI",
      },
      { status: 500 }
    );
  }
}
