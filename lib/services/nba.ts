import axios from "axios";
import { logger } from "../logger";

const GAMMA_API_BASE = process.env.GAMMA_API_BASE || "https://gamma-api.polymarket.com";

// NBA Series ID on Polymarket (from /sports endpoint)
const NBA_SERIES_ID = "10345";
const NBA_TAG_ID = 745;

export interface PolymarketEvent {
  id: string;
  ticker: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  category: string;
  slug: string;
  markets: PolymarketMarket[];
  commentCount: number;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  groupItemTitle: string;
  groupItemOrder: number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  liquidity: string;
  volume: string;
  outcomes: string;
  outcomePrices: string;
  startDate: string;
  endDate: string;
}

export interface NBAGame {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  volume: number;
  moneyline: {
    home: { name: string; price: number };
    away: { name: string; price: number };
  } | null;
  spread: {
    line: string;
    home: number;
    away: number;
  } | null;
  total: {
    line: string;
    over: number;
    under: number;
  } | null;
}

export interface NBAProp {
  id: string;
  question: string;
  slug: string;
  volume: number;
  outcomes: Array<{ name: string; price: number }>;
  endDate: string;
  image: string;
}

export class NBAService {
  /**
   * Fetches NBA Games (Team A vs Team B matchups) using series_id
   * Returns all active games from Polymarket
   */
  static async getGames(search?: string): Promise<NBAGame[]> {
    try {
      const response = await axios.get(`${GAMMA_API_BASE}/events`, {
        params: {
          series_id: NBA_SERIES_ID,
          active: true,
          closed: false,
          limit: 100,
        },
      });

      const events: PolymarketEvent[] = response.data || [];
      
      // Get current date/time
      const now = new Date();
      
      // Filter for real matchups only (Team vs Team) AND upcoming games only (endDate >= now)
      let matchups = events.filter((e) => {
        if (!this.isRealMatchup(e)) return false;
        // Only include games where endDate (game time) is in the future
        const gameDate = new Date(e.endDate);
        return gameDate >= now;
      });

      // Sort by endDate (actual game time) - upcoming first
      matchups.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

      // Transform to NBAGame format - use endDate as game time
      let games = matchups.map((e) => this.transformToGame(e));

      // Apply search filter if provided
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        games = games.filter(
          (g) =>
            g.homeTeam.toLowerCase().includes(searchLower) ||
            g.awayTeam.toLowerCase().includes(searchLower) ||
            g.title.toLowerCase().includes(searchLower)
        );
      }

      return games;
    } catch (error) {
      logger.error("Error fetching NBA games:", { error });
      return [];
    }
  }

  /**
   * Fetches NBA Props (League-wide markets like Champion, MVP, etc.) using tag_id
   */
  static async getProps(search?: string): Promise<NBAProp[]> {
    try {
      const response = await axios.get(`${GAMMA_API_BASE}/events`, {
        params: {
          tag_id: NBA_TAG_ID,
          active: true,
          closed: false,
          limit: 100,
        },
      });

      const events: PolymarketEvent[] = response.data || [];
      
      // Filter for league-wide props (NOT game matchups)
      let props = events.filter((e) => this.isLeagueProp(e));

      // Sort by volume (highest first)
      props.sort((a, b) => b.volume - a.volume);

      // Transform to NBAProp format
      let transformedProps = props.map((e) => this.transformToProp(e));

      // Apply search filter if provided
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        transformedProps = transformedProps.filter(
          (p) =>
            p.question.toLowerCase().includes(searchLower) ||
            p.outcomes.some((o) => o.name.toLowerCase().includes(searchLower))
        );
      }

      return transformedProps;
    } catch (error) {
      logger.error("Error fetching NBA props:", { error });
      return [];
    }
  }

  /**
   * Determines if an event is a real team matchup
   */
  private static isRealMatchup(event: PolymarketEvent): boolean {
    const title = event.title.toLowerCase();
    
    // Must contain "vs" or "@" for matchup format
    const isMatchupFormat = title.includes(" vs ") || title.includes(" vs. ") || title.includes(" @ ");
    
    // Must be active and not closed
    return isMatchupFormat && event.active && !event.closed;
  }

  /**
   * Determines if an event is a league-wide prop
   */
  private static isLeagueProp(event: PolymarketEvent): boolean {
    const title = event.title.toLowerCase();
    
    // Must NOT be a matchup
    const isMatchup = title.includes(" vs ") || title.includes(" vs. ") || title.includes(" @ ");
    if (isMatchup) return false;

    // Must be active and not closed
    return event.active && !event.closed;
  }

  /**
   * Transform Polymarket event to NBAGame
   */
  private static transformToGame(event: PolymarketEvent): NBAGame {
    const { homeTeam, awayTeam } = this.parseTeams(event.title);

    // Find markets for Moneyline, Spread, Total
    const moneyline = this.findMoneylineMarket(event.markets, homeTeam, awayTeam);
    const spread = this.findSpreadMarket(event.markets);
    const total = this.findTotalMarket(event.markets);

    return {
      id: event.id,
      title: event.title,
      homeTeam,
      awayTeam,
      startTime: event.endDate, // Use endDate as actual game time
      volume: event.volume,
      moneyline,
      spread,
      total,
    };
  }

  /**
   * Transform Polymarket event to NBAProp
   */
  private static transformToProp(event: PolymarketEvent): NBAProp {
    let outcomes: Array<{ name: string; price: number }> = [];

    // Get outcomes from markets (each market represents one option)
    if (event.markets && event.markets.length > 0) {
      outcomes = event.markets
        .filter((m) => m.active && !m.closed)
        .map((market) => {
          try {
            const prices = JSON.parse(market.outcomePrices);
            return {
              name: market.groupItemTitle || market.question,
              price: parseFloat(prices[0]) || 0,
            };
          } catch {
            return { name: market.groupItemTitle || "Unknown", price: 0 };
          }
        })
        .filter((o) => o.price > 0);

      // Sort by probability (highest first) and take top 5
      outcomes.sort((a, b) => b.price - a.price);
      outcomes = outcomes.slice(0, 5);
    }

    return {
      id: event.id,
      question: event.title,
      slug: event.slug,
      volume: event.volume,
      outcomes,
      endDate: event.endDate,
      image: event.image || event.icon,
    };
  }

  /**
   * Parse team names from title
   */
  private static parseTeams(title: string): { homeTeam: string; awayTeam: string } {
    if (title.includes(" @ ")) {
      const parts = title.split(" @ ");
      return { awayTeam: parts[0].trim(), homeTeam: parts[1].trim() };
    }
    
    const separator = title.includes(" vs. ") ? " vs. " : " vs ";
    const parts = title.split(separator);
    return {
      homeTeam: parts[0]?.trim() || "TBD",
      awayTeam: parts[1]?.trim() || "TBD",
    };
  }

  /**
   * Find Moneyline market - look for "1H Moneyline" or derive from spread=0 if available
   */
  private static findMoneylineMarket(
    markets: PolymarketMarket[],
    homeTeam: string,
    awayTeam: string
  ): NBAGame["moneyline"] {
    // First, look for a market with "moneyline" in groupItemTitle (not 1H)
    let ml = markets.find(
      (m) =>
        m.active &&
        !m.closed &&
        m.groupItemTitle?.toLowerCase().includes("moneyline") &&
        !m.groupItemTitle?.toLowerCase().includes("1h")
    );

    // If no full-game moneyline, try to find it in question or slug
    if (!ml) {
      ml = markets.find(
        (m) =>
          m.active &&
          !m.closed &&
          (m.question?.toLowerCase().includes("will win") ||
           m.slug?.includes("winner") ||
           m.slug?.includes("moneyline"))
      );
    }

    // Fallback: use the lowest spread as a proxy for moneyline feel
    if (!ml) {
      const spreads = markets.filter(
        (m) =>
          m.active &&
          !m.closed &&
          m.groupItemTitle?.toLowerCase().includes("spread") &&
          !m.groupItemTitle?.toLowerCase().includes("1h")
      );
      if (spreads.length > 0) {
        // Sort by absolute spread value to get closest to 0
        spreads.sort((a, b) => {
          const aMatch = a.groupItemTitle?.match(/-?\d+\.?\d*/);
          const bMatch = b.groupItemTitle?.match(/-?\d+\.?\d*/);
          const aVal = aMatch ? Math.abs(parseFloat(aMatch[0])) : 999;
          const bVal = bMatch ? Math.abs(parseFloat(bMatch[0])) : 999;
          return aVal - bVal;
        });
        // Use the smallest spread as quasi-moneyline
        ml = spreads[0];
      }
    }

    if (!ml) return null;

    try {
      const prices = JSON.parse(ml.outcomePrices);
      return {
        home: { name: homeTeam, price: parseFloat(prices[0]) || 0.5 },
        away: { name: awayTeam, price: parseFloat(prices[1]) || 0.5 },
      };
    } catch {
      return null;
    }
  }

  /**
   * Find Spread market - full game only (exclude 1H)
   */
  private static findSpreadMarket(markets: PolymarketMarket[]): NBAGame["spread"] {
    // Get all full-game spreads (not 1H)
    const spreads = markets.filter(
      (m) =>
        m.active &&
        !m.closed &&
        m.groupItemTitle?.toLowerCase().includes("spread") &&
        !m.groupItemTitle?.toLowerCase().includes("1h")
    );

    if (spreads.length === 0) return null;

    // Sort by absolute spread value and take the most common/primary one
    spreads.sort((a, b) => {
      const aMatch = a.groupItemTitle?.match(/-?\d+\.?\d*/);
      const bMatch = b.groupItemTitle?.match(/-?\d+\.?\d*/);
      const aVal = aMatch ? Math.abs(parseFloat(aMatch[0])) : 999;
      const bVal = bMatch ? Math.abs(parseFloat(bMatch[0])) : 999;
      return aVal - bVal;
    });

    const spread = spreads[0];
    
    try {
      const prices = JSON.parse(spread.outcomePrices);
      const lineMatch = spread.groupItemTitle?.match(/-?\d+\.?\d*/);
      const line = lineMatch ? lineMatch[0] : "0";
      
      return {
        line,
        home: parseFloat(prices[0]) || 0.5,
        away: parseFloat(prices[1]) || 0.5,
      };
    } catch {
      return null;
    }
  }

  /**
   * Find Total (Over/Under) market - full game only (exclude 1H)
   */
  private static findTotalMarket(markets: PolymarketMarket[]): NBAGame["total"] {
    // Get all full-game totals (not 1H)
    const totals = markets.filter(
      (m) =>
        m.active &&
        !m.closed &&
        (m.groupItemTitle?.toLowerCase().includes("o/u") ||
         m.groupItemTitle?.toLowerCase().includes("total")) &&
        !m.groupItemTitle?.toLowerCase().includes("1h")
    );

    if (totals.length === 0) return null;

    // Sort by line value to get the most common/central one
    totals.sort((a, b) => {
      const aMatch = a.groupItemTitle?.match(/\d+\.?\d*/);
      const bMatch = b.groupItemTitle?.match(/\d+\.?\d*/);
      const aVal = aMatch ? parseFloat(aMatch[0]) : 0;
      const bVal = bMatch ? parseFloat(bMatch[0]) : 0;
      // Take the middle value (median-ish)
      return Math.abs(aVal - 240) - Math.abs(bVal - 240);
    });

    const total = totals[0];
    
    try {
      const prices = JSON.parse(total.outcomePrices);
      const lineMatch = total.groupItemTitle?.match(/\d+\.?\d*/);
      const line = lineMatch ? lineMatch[0] : "0";
      
      return {
        line,
        over: parseFloat(prices[0]) || 0.5,
        under: parseFloat(prices[1]) || 0.5,
      };
    } catch {
      return null;
    }
  }
}
