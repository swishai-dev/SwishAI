import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateAnalysis } from "@/lib/ai/analyst";
import { fetchMatchupContext } from "@/lib/data/sports-api";
import crypto from "crypto";

function generateStateHash(marketId: string, odds: number[]) {
  const oddsKey = odds.map(o => Math.round(o * 100)).join('-');
  const date = new Date().toISOString().split('T')[0]; // Cache for current day
  return crypto.createHash('sha256').update(`${marketId}-${oddsKey}-${date}`).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { marketId, currentOdds, matchup } = await request.json();
    
    // Validate input
    if (!marketId || !currentOdds || !Array.isArray(currentOdds)) {
      return NextResponse.json({ error: "Invalid market data" }, { status: 400 });
    }

    const stateHash = generateStateHash(marketId, currentOdds);

    // 1. Check Cache with State Hash
    const cachedAnalysis = await prisma.analysis.findFirst({
      where: { stateHash },
      include: { market: true },
      orderBy: { createdAt: "desc" }
    });

    if (cachedAnalysis) {
      return NextResponse.json({
        id: cachedAnalysis.id,
        isCached: true,
        data: {
          predictedProbability: cachedAnalysis.probability,
          prediction: cachedAnalysis.prediction,
          report: cachedAnalysis.reasoning,
          // Since we changed dimensions to be dynamic/mocked in analyst, we keep them here or fetch from reasoning
          dimensions: {
            form: "High",
            injuries: "Minor",
            schedule: "Neutral"
          }
        }
      });
    }

    // 2. Fetch Fresh Data & Generate Analysis
    const homeTeamName = matchup?.home || "Home Team";
    const awayTeamName = matchup?.away || "Away Team";
    
    const context = await fetchMatchupContext(homeTeamName, awayTeamName);
    const analysis = await generateAnalysis({
      matchup: `${homeTeamName} vs ${awayTeamName}`,
      marketOdds: currentOdds[0], // Home probability for comparison
      stats: context
    });

    // 3. Ensure Market exists and Persist Analysis
    try {
      // Find internal market by external ID
      let market = await prisma.market.findUnique({
        where: { externalMarketId: marketId }
      });

      if (!market) {
        // Create a minimal market if not found (should be rare if explorer is used)
        market = await prisma.market.create({
          data: {
            externalMarketId: marketId,
            type: "PROP",
            question: matchup?.question || "Matchup Analysis",
            outcomes: matchup?.outcomes || ["Yes", "No"],
            currentOdds: currentOdds,
          }
        });
      }

      await prisma.analysis.create({
        data: {
          marketId: market.id,
          prediction: analysis.predictedProbability > 0.5 ? (matchup?.outcomes?.[0] || homeTeamName) : (matchup?.outcomes?.[1] || awayTeamName),
          probability: analysis.predictedProbability,
          reasoning: analysis.report,
          stateHash: stateHash
        }
      });
    } catch (e) {
      console.warn("Persistence skipped (DB connection or constraints):", e.message);
    }
    
    return NextResponse.json({
      id: "fresh-" + Date.now(),
      isCached: false,
      data: analysis
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
