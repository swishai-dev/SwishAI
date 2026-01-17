import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";

    if (type === "game") {
      prompt = `You are an expert NBA betting analyst. Analyze this upcoming NBA game and provide betting insights.

Game: ${data.awayTeam} @ ${data.homeTeam}
Start Time: ${data.startTime}
Volume Traded: $${data.volume?.toLocaleString() || "N/A"}

Current Lines:
- Moneyline: ${data.moneyline ? `${data.awayTeam} ${Math.round(data.moneyline.away.price * 100)}¢ / ${data.homeTeam} ${Math.round(data.moneyline.home.price * 100)}¢` : "N/A"}
- Spread: ${data.spread ? `${data.homeTeam} ${data.spread.line} (${Math.round(data.spread.home * 100)}¢ / ${Math.round(data.spread.away * 100)}¢)` : "N/A"}
- Total: ${data.total ? `O/U ${data.total.line} (Over ${Math.round(data.total.over * 100)}¢ / Under ${Math.round(data.total.under * 100)}¢)` : "N/A"}

Provide a concise analysis (max 200 words) covering:
1. Key matchup factors
2. Best betting value (if any)
3. Risk assessment
4. Final recommendation

Be direct and actionable. Use bullet points.`;
    } else if (type === "prop") {
      prompt = `You are an expert NBA futures and props analyst. Analyze this NBA market.

Market: ${data.question}
Total Volume: $${data.volume?.toLocaleString() || "N/A"}

Top Options:
${data.outcomes?.map((o: any, i: number) => `${i + 1}. ${o.name}: ${Math.round(o.price * 100)}%`).join("\n") || "N/A"}

Provide a concise analysis (max 150 words) covering:
1. Current market sentiment
2. Value opportunities
3. Risk factors
4. Top pick recommendation

Be direct and actionable.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
