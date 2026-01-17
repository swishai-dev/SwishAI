import { NextRequest, NextResponse } from "next/server";
import { fetchBasketballMarkets } from "@/lib/data/polymarket";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get("league") || undefined;
  const search = searchParams.get("search") || undefined;
  const type = (searchParams.get("type") as "games" | "props") || "games";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "30", 10) || 30));

  try {
    const { markets, total } = await fetchBasketballMarkets({
      league,
      type,
      search,
      page,
      pageSize
    });
    
    return NextResponse.json({
      markets,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error("API Error fetching markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
