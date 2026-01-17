import { PolymarketService } from "./polymarket";
import { Game, League } from "../../types/domain";
import { PolymarketEvent } from "../../types/polymarket";
import { logger } from "../logger";
import { CacheService } from "./cache";
import { SnapshotService } from "./snapshot";

const BASKETBALL_TAG_IDS: Record<League, number[]> = {
  [League.NBA]: [745],
  [League.NCAA]: [100149],
  [League.EURO]: [100346, 103093, 103095, 100639], // Added common Euro tags
  [League.ALL]: [745, 100149, 100346, 103093, 103095, 100639],
};

export class GameService {
  /**
   * Fetches and normalizes basketball games from Polymarket.
   */
  static async getGames(options: {
    league?: League;
    limit?: number;
    offset?: number;
    useCache?: boolean;
  }): Promise<{ games: Game[]; total: number; fallback?: boolean }> {
    const { league = League.ALL, limit = 30, offset = 0, useCache = true } = options;
    const cacheKey = `swish:v1:games:${league}:${limit}:${offset}`;

    if (useCache) {
      const cached = await CacheService.get<{ games: Game[]; total: number; fallback?: boolean }>(cacheKey, true);
      if (cached) return cached;
    }

    const tagIds = BASKETBALL_TAG_IDS[league];

    try {
      let allEvents: PolymarketEvent[] = [];

      // Fetch events for each tag ID in the league group
      for (const tagId of tagIds) {
        const events = await PolymarketService.fetchEvents({ tagId, limit: 100 });
        allEvents = [...allEvents, ...events];
      }

      // De-duplicate events by ID
      const uniqueEvents = Array.from(new Map(allEvents.map((e) => [e.id, e])).values());

      // Filter for real matchups (Team A vs Team B) and basketball keywords
      const matchups = uniqueEvents.filter((e) => this.isRealMatchup(e));

      // Sort by start time ascending (upcoming first)
      matchups.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      // Normalize to Domain model
      const normalizedGames: Game[] = matchups.map((e) => this.normalizeEvent(e));

      const result = {
        games: normalizedGames.slice(offset, offset + limit),
        total: normalizedGames.length,
      };

      if (useCache) {
        await CacheService.set(cacheKey, result, 300); // 5 minute cache
      }

      // Proactively create snapshot for fallback
      if (normalizedGames.length > 0) {
        await SnapshotService.createSnapshot(league, result);
      }

      return result;
    } catch (error) {
      logger.error("Error in GameService.getGames", { error, league });
      
      // Fallback to latest snapshot
      const snapshot = await SnapshotService.getLatestSnapshot(league);
      if (snapshot) {
        logger.info(`Using fallback snapshot for ${league}`);
        return { ...snapshot, fallback: true };
      }
      
      throw error;
    }
  }

  /**
   * Determines if an event is a real team matchup (vs / @).
   */
  private static isRealMatchup(event: PolymarketEvent): boolean {
    const title = event.title.toLowerCase();
    const isMatchupFormat = title.includes(" vs ") || title.includes(" vs. ") || title.includes(" @ ");
    
    // Exclude common non-matchup keywords
    const isSpeculative = title.includes("winner") || title.includes("champion") || title.includes("awards") || title.includes("draft");
    
    return isMatchupFormat && !isSpeculative && event.active && !event.closed;
  }

  /**
   * Normalizes a PolymarketEvent to our internal Game interface.
   */
  private static normalizeEvent(event: PolymarketEvent): Game {
    const { homeTeam, awayTeam } = this.parseTeamsFromTitle(event.title);
    
    return {
      event_id: event.id,
      league: this.detectLeague(event),
      home_team: homeTeam,
      away_team: awayTeam,
      start_time: event.startDate,
      event_title: event.title,
      status: "ACTIVE",
    };
  }

  /**
   * Parses team names from event titles like "Lakers vs Celtics".
   */
  private static parseTeamsFromTitle(title: string): { homeTeam: string; awayTeam: string } {
    let separator = " vs ";
    if (title.includes(" vs. ")) separator = " vs. ";
    if (title.includes(" @ ")) {
      // "Away @ Home" format
      const parts = title.split(" @ ");
      return {
        awayTeam: parts[0].trim(),
        homeTeam: parts[1].trim(),
      };
    }

    const parts = title.split(separator);
    return {
      homeTeam: parts[0]?.trim() || "Unknown",
      awayTeam: parts[1]?.trim() || "Unknown",
    };
  }

  /**
   * Detects the league based on event metadata and tags.
   */
  private static detectLeague(event: PolymarketEvent): League {
    const text = (event.title + " " + event.category).toUpperCase();
    if (text.includes("NBA")) return League.NBA;
    if (text.includes("NCAA") || text.includes("MARCH MADNESS")) return League.NCAA;
    if (text.includes("EURO") || text.includes("EUROLEAGUE")) return League.EURO;
    
    // Check tags
    if (event.tags) {
      for (const tag of event.tags) {
        if (tag.label.toUpperCase().includes("NBA")) return League.NBA;
        if (tag.label.toUpperCase().includes("NCAA")) return League.NCAA;
        if (tag.label.toUpperCase().includes("EURO")) return League.EURO;
      }
    }

    return League.ALL;
  }
}
