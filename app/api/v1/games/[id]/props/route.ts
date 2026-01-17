import { NextRequest, NextResponse } from "next/server";
import { PolymarketService } from "../../../../../../lib/services/polymarket";
import { PropService } from "../../../../../../lib/services/prop";
import { logger } from "../../../../../../lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  try {
    const event = await PolymarketService.fetchEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: "Game not found", code: "GAME_NOT_FOUND" },
        { status: 404 }
      );
    }

    const props = await PropService.getPropsForEvent(eventId, event.markets);

    return NextResponse.json({
      event_id: eventId,
      props,
    });
  } catch (error) {
    logger.error(`API Error in /api/v1/games/${eventId}/props`, { error });
    return NextResponse.json(
      { error: "Failed to fetch props", code: "UPSTREAM_ERROR" },
      { status: 500 }
    );
  }
}
