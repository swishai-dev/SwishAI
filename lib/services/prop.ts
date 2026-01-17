import { PolymarketMarket } from "../../types/polymarket";
import { Prop, PropType } from "../../types/domain";
import { logger } from "../logger";

export class PropService {
  /**
   * Extracts and normalizes head props (ML, Spread, Totals) from an event's markets.
   */
  static async getPropsForEvent(eventId: string, markets: PolymarketMarket[]): Promise<Prop[]> {
    try {
      const props: Prop[] = [];

      for (const market of markets) {
        const type = this.detectPropType(market);
        if (type) {
          props.push(this.normalizeProp(eventId, market, type));
        }
      }

      // De-duplicate by type (Polymarket might have multiple spreads, we take the primary one)
      // For now, we take the first of each type as the "head" prop
      const headPropsMap = new Map<PropType, Prop>();
      props.forEach((p) => {
        if (!headPropsMap.has(p.prop_type)) {
          headPropsMap.set(p.prop_type, p);
        }
      });

      return Array.from(headPropsMap.values());
    } catch (error) {
      logger.error("Error in PropService.getPropsForEvent", { error, eventId });
      return [];
    }
  }

  /**
   * Detects if a market is a core head prop.
   */
  private static detectPropType(market: PolymarketMarket): PropType | null {
    const question = market.question.toLowerCase();
    const slug = market.slug.toLowerCase();
    const groupTitle = (market.groupItemTitle || "").toLowerCase();

    // 1. Moneyline
    if (
      slug.includes("winner") || 
      question.includes("who will win") || 
      groupTitle.includes("moneyline")
    ) {
      return PropType.MONEYLINE;
    }

    // 2. Spread
    if (
      slug.includes("spread") || 
      question.includes("spread") || 
      groupTitle.includes("spread")
    ) {
      return PropType.SPREAD;
    }

    // 3. Totals
    if (
      slug.includes("total") || 
      question.includes("over/under") || 
      groupTitle.includes("total")
    ) {
      return PropType.TOTALS;
    }

    return null;
  }

  /**
   * Normalizes a PolymarketMarket to our internal Prop interface.
   */
  private static normalizeProp(eventId: string, market: PolymarketMarket, type: PropType): Prop {
    let outcomes: string[] = [];
    try {
      outcomes = JSON.parse(market.outcomes);
    } catch (e) {
      outcomes = ["Yes", "No"];
    }

    return {
      market_id: market.id,
      event_id: eventId,
      prop_type: type,
      prop_title: market.question,
      outcomes,
      current_status: market.active && !market.closed ? "ACTIVE" : "CLOSED",
    };
  }
}
