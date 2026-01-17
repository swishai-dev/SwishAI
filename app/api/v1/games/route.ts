import { NextRequest, NextResponse } from "next/server";
import { GameService } from "../../../../lib/services/game";
import { League } from "../../../../types/domain";
import { logger } from "../../../../lib/logger";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = (searchParams.get("league") as League) || League.ALL;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "30", 10)));
  const offset = (page - 1) * pageSize;

  try {
    const { games, total, fallback } = await GameService.getGames({
      league,
      limit: pageSize,
      offset,
    });

    return NextResponse.json({
      games,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      fallback_data: fallback || false,
    });
  } catch (error) {
    logger.error("API Error in /api/v1/games", { error });
    return NextResponse.json(
      { error: "Failed to fetch games", code: "UPSTREAM_ERROR" },
      { status: 500 }
    );
  }
}
