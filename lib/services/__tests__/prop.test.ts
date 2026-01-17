import { describe, it, expect } from "vitest";
import { PropService } from "../prop";
import { PropType } from "../../../types/domain";
import { PolymarketMarket } from "../../../types/polymarket";

describe("PropService", () => {
  describe("detectPropType", () => {
    it("should detect Moneyline", () => {
      const market = { 
        question: "Who will win the game?", 
        slug: "lakers-vs-celtics-winner",
        groupItemTitle: "Moneyline" 
      } as PolymarketMarket;
      
      // @ts-ignore
      expect(PropService.detectPropType(market)).toBe(PropType.MONEYLINE);
    });

    it("should detect Spread", () => {
      const market = { 
        question: "Lakers -4.5 Spread", 
        slug: "lakers-spread",
        groupItemTitle: "Spread" 
      } as PolymarketMarket;
      
      // @ts-ignore
      expect(PropService.detectPropType(market)).toBe(PropType.SPREAD);
    });

    it("should detect Totals", () => {
      const market = { 
        question: "Over/Under 220.5 Points", 
        slug: "lakers-total-points",
        groupItemTitle: "Total Points" 
      } as PolymarketMarket;
      
      // @ts-ignore
      expect(PropService.detectPropType(market)).toBe(PropType.TOTALS);
    });

    it("should return null for other market types", () => {
      const market = { 
        question: "How many points will LeBron score?", 
        slug: "lebron-points-prop",
        groupItemTitle: "Player Props" 
      } as PolymarketMarket;
      
      // @ts-ignore
      expect(PropService.detectPropType(market)).toBe(null);
    });
  });

  describe("getPropsForEvent", () => {
    it("should return unique head props", async () => {
      const markets = [
        { id: "1", question: "Winner", slug: "winner", active: true, closed: false, outcomes: "[]" },
        { id: "2", question: "Spread -4.5", slug: "spread", active: true, closed: false, outcomes: "[]" },
        { id: "3", question: "Spread -5.5", slug: "spread-2", active: true, closed: false, outcomes: "[]" },
        { id: "4", question: "Over 220", slug: "total", active: true, closed: false, outcomes: "[]" },
      ] as PolymarketMarket[];

      const props = await PropService.getPropsForEvent("event-1", markets);
      
      expect(props.length).toBe(3); // ML, Spread, Total (one spread only)
      expect(props.map(p => p.prop_type)).toContain(PropType.MONEYLINE);
      expect(props.map(p => p.prop_type)).toContain(PropType.SPREAD);
      expect(props.map(p => p.prop_type)).toContain(PropType.TOTALS);
    });
  });
});
