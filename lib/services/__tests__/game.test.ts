import { describe, it, expect, vi } from "vitest";
import { GameService } from "../game";
import { League } from "../../../types/domain";

describe("GameService", () => {
  describe("isRealMatchup", () => {
    it("should return true for valid matchup formats", () => {
      const validEvents = [
        { title: "Lakers vs Celtics", active: true, closed: false },
        { title: "Grizzlies vs. Lakers", active: true, closed: false },
        { title: "Knicks @ Bulls", active: true, closed: false },
      ];

      validEvents.forEach((e) => {
        // @ts-ignore - testing private method
        expect(GameService.isRealMatchup(e)).toBe(true);
      });
    });

    it("should return false for speculative markets", () => {
      const invalidEvents = [
        { title: "NBA Winner 2026", active: true, closed: false },
        { title: "MVP Awards", active: true, closed: false },
        { title: "Western Conference Champion", active: true, closed: false },
      ];

      invalidEvents.forEach((e) => {
        // @ts-ignore - testing private method
        expect(GameService.isRealMatchup(e)).toBe(false);
      });
    });
  });

  describe("parseTeamsFromTitle", () => {
    it("should correctly parse 'vs' format", () => {
      // @ts-ignore
      const result = GameService.parseTeamsFromTitle("Lakers vs Celtics");
      expect(result.homeTeam).toBe("Lakers");
      expect(result.awayTeam).toBe("Celtics");
    });

    it("should correctly parse 'vs.' format", () => {
      // @ts-ignore
      const result = GameService.parseTeamsFromTitle("Grizzlies vs. Lakers");
      expect(result.homeTeam).toBe("Grizzlies");
      expect(result.awayTeam).toBe("Lakers");
    });

    it("should correctly parse '@' format (Away @ Home)", () => {
      // @ts-ignore
      const result = GameService.parseTeamsFromTitle("Knicks @ Bulls");
      expect(result.awayTeam).toBe("Knicks");
      expect(result.homeTeam).toBe("Bulls");
    });
  });

  describe("detectLeague", () => {
    it("should detect NBA", () => {
      const event = { title: "Lakers vs Celtics", category: "Basketball", tags: [{ label: "NBA" }] };
      // @ts-ignore
      expect(GameService.detectLeague(event)).toBe(League.NBA);
    });

    it("should detect NCAA", () => {
      const event = { title: "Duke vs UNC", category: "NCAA Basketball", tags: [] };
      // @ts-ignore
      expect(GameService.detectLeague(event)).toBe(League.NCAA);
    });

    it("should detect EuroLeague", () => {
      const event = { title: "Real Madrid vs Barcelona", category: "EuroLeague", tags: [] };
      // @ts-ignore
      expect(GameService.detectLeague(event)).toBe(League.EURO);
    });
  });
});
