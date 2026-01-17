// Polymarket Gamma REST API Client for Basketball
const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

// Known Basketball Tag IDs for reliable fetching
const BASKETBALL_TAG_IDS = [
  745,    // NBA
  100149, // NCAA Basketball
  100254, // WNBA
  100639, // General Basketball
  103093, // Basketball Champions League
  103095  // Basketball Series A
];

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  groupItemTitle: string;
  category: string;
  active: boolean;
  closed: boolean;
  outcomePrices: string; // JSON string
  outcomes: string; // JSON string
  startDate: string;
  volume: string | number;
  slug: string;
}

export interface PolymarketEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  closed: boolean;
  active: boolean;
  commentCount?: number;
  markets: PolymarketMarket[];
}

export interface AggregatedMarket {
  id: string;
  league: string;
  startTime: string;
  volume: number;
  commentCount: number;
  question: string;
  type: "game" | "prop";
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  moneyline?: { home: number; away: number };
  spread?: { home: string; homeOdds: number; away: string; awayOdds: number };
  total?: { over: string; overOdds: number; under: string; underOdds: number };
  outcomes?: string[];
  outcomePrices?: number[];
}

const normalizeText = (value?: string) => (value || "").toLowerCase();

const isBasketballMarket = (market: PolymarketMarket) => {
  const haystack = normalizeText(`${market.question} ${market.category} ${market.groupItemTitle} ${market.slug}`);
  const keywords = ["basketball", "nba", "euroleague", "ncaa", "wnba", "fiba", "eurocup", "march madness"];
  return keywords.some(k => haystack.includes(k));
};

const isPropMarket = (market: PolymarketMarket) => {
  const q = normalizeText(market.question);
  const s = normalizeText(market.slug);
  // Matchups usually have vs, @, or explicit team names in a vs format
  const isMatchup = q.includes(" vs ") || q.includes(" vs. ") || q.includes(" @ ") || s.includes("-vs-");
  if (isMatchup && !q.includes("will")) return false; // Heuristic: matchups aren't props unless they start with "Will"

  const propKeywords = ["points", "rebounds", "assists", "player", "over/under", "total points", "record", "will lebron", "will curry"];
  return propKeywords.some(k => q.includes(k) || s.includes(k));
};

const matchesLeague = (item: PolymarketMarket | PolymarketEvent, league?: string) => {
  if (!league || league === "all") return true;
  const target = league.toLowerCase();
  
  const title = 'title' in item ? item.title : item.question;
  const description = 'description' in item ? item.description : "";
  const category = 'category' in item ? item.category : "";
  const group = 'groupItemTitle' in item ? item.groupItemTitle : "";
  
  const haystack = normalizeText(`${title} ${description} ${category} ${group}`);
  
  if (target === "nba") return haystack.includes("nba") && !haystack.includes("ncaa") && !haystack.includes("wnba");
  if (target === "euroleague") return haystack.includes("euroleague") || haystack.includes("euro league") || haystack.includes("euro cup") || haystack.includes("eurocup");
  if (target === "ncaa") return haystack.includes("ncaa") || haystack.includes("college basketball") || haystack.includes("march madness");
  
  return haystack.includes(target);
};

export const fetchBasketballMarkets = async (
  options: {
    league?: string;
    type?: "games" | "props";
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<{ markets: AggregatedMarket[]; total: number }> => {
  const { league, type = "games", search, page = 1, pageSize = 30 } = options;
  
  try {
    if (type === "games") {
      // 1. Fetch active events using basketball-related tags
      const allEvents: PolymarketEvent[] = [];
      const tagsToFetch = league && league !== "all" ? BASKETBALL_TAG_IDS : [745, 100149, 100639]; // Default to major ones

      for (const tagId of tagsToFetch) {
        const response = await fetch(
          `${GAMMA_API_BASE}/events?tag_id=${tagId}&active=true&closed=false&limit=100&order=startTime&ascending=true`,
          { next: { revalidate: 60 } }
        );
        if (response.ok) {
          const events: PolymarketEvent[] = await response.json();
          allEvents.push(...events);
        }
      }

      // 2. De-duplicate and filter
      const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());
      const basketballMatchups = uniqueEvents.filter(e => {
        const title = e.title.toLowerCase();
        const isMatchup = title.includes(" vs ") || title.includes(" vs. ") || title.includes(" @ ");
        return isMatchup && matchesLeague(e, league);
      });

      let finalMarkets: AggregatedMarket[] = basketballMatchups.map(event => {
        const markets = event.markets;
        
        // Accurate Market Detection
        const mlMarket = markets.find(m => {
          const q = m.question.toLowerCase();
          const s = m.slug.toLowerCase();
          return !q.includes("spread") && !q.includes("total") && !q.includes("over/under") && 
                 (s.includes("winner") || s.includes("win-") || q.includes("winner") || (!q.includes("points") && !q.includes("line")));
        });
        
        const spreadMarket = markets.find(m => {
          const q = m.question.toLowerCase();
          const s = m.slug.toLowerCase();
          return q.includes("spread") || s.includes("spread") || (q.includes(" vs ") && (q.includes("+") || q.includes("-")));
        });

        const totalMarket = markets.find(m => {
          const q = m.question.toLowerCase();
          const s = m.slug.toLowerCase();
          return q.includes("total") || s.includes("total") || q.includes("over/under");
        });
        
        const parsePrices = (m?: PolymarketMarket) => {
          if (!m || !m.outcomePrices) return [0.5, 0.5];
          try {
            const p = JSON.parse(m.outcomePrices).map((val: string) => parseFloat(val));
            return p.length >= 2 ? p : [0.5, 0.5];
          } catch (e) {
            return [0.5, 0.5];
          }
        };

        const parseOutcomes = (m?: PolymarketMarket) => {
          if (!m || !m.outcomes) return ["", ""];
          try {
            return JSON.parse(m.outcomes);
          } catch (e) {
            return ["", ""];
          }
        };

        const pricesML = parsePrices(mlMarket);
        const pricesSpread = parsePrices(spreadMarket);
        const pricesTotal = parsePrices(totalMarket);
        
        const outcomesSpread = parseOutcomes(spreadMarket);
        const outcomesTotal = parseOutcomes(totalMarket);
        
        let teams: string[] = [];
        if (event.title.includes(" vs. ")) teams = event.title.split(" vs. ");
        else if (event.title.includes(" vs ")) teams = event.title.split(" vs ");
        else if (event.title.includes(" @ ")) teams = event.title.split(" @ ").reverse();
        
        const homeName = teams[0]?.trim() || "Home Team";
        const awayName = teams[1]?.trim() || "Away Team";

        return {
          id: event.id,
          league: league === "all" ? "Basketball" : league || "NBA",
          startTime: event.startTime,
          volume: markets.reduce((acc, m) => acc + (typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0), 0),
          commentCount: event.commentCount || 0,
          question: event.title,
          type: "game",
          homeTeam: { 
            name: homeName, 
            logo: `https://logo.clearbit.com/${homeName.toLowerCase().replace(/\s+/g, '')}.com` 
          },
          awayTeam: { 
            name: awayName, 
            logo: `https://logo.clearbit.com/${awayName.toLowerCase().replace(/\s+/g, '')}.com` 
          },
          moneyline: mlMarket ? { home: pricesML[0], away: pricesML[1] } : undefined,
          spread: spreadMarket ? {
            home: outcomesSpread[0],
            homeOdds: pricesSpread[0],
            away: outcomesSpread[1],
            awayOdds: pricesSpread[1]
          } : undefined,
          total: totalMarket ? {
            over: outcomesTotal[0],
            overOdds: pricesTotal[0],
            under: outcomesTotal[1],
            underOdds: pricesTotal[1]
          } : undefined
        };
      });

      if (search) {
        const searchLower = search.toLowerCase();
        finalMarkets = finalMarkets.filter(m => 
          m.question.toLowerCase().includes(searchLower) ||
          m.homeTeam.name.toLowerCase().includes(searchLower) ||
          m.awayTeam.name.toLowerCase().includes(searchLower)
        );
      }

      const total = finalMarkets.length;
      const start = (page - 1) * pageSize;
      return { markets: finalMarkets.slice(start, start + pageSize), total };

    } else {
      // Props logic
      const allMarkets: PolymarketMarket[] = [];
      for (const tagId of BASKETBALL_TAG_IDS) {
        const response = await fetch(
          `${GAMMA_API_BASE}/markets?tag_id=${tagId}&active=true&closed=false&limit=100&order=startDate&ascending=false`,
          { next: { revalidate: 60 } }
        );
        if (response.ok) {
          const markets: PolymarketMarket[] = await response.json();
          allMarkets.push(...markets);
        }
      }

      const uniqueMarkets = Array.from(new Map(allMarkets.map(m => [m.id, m])).values());
      const basketballProps = uniqueMarkets.filter(m => isBasketballMarket(m) && isPropMarket(m) && matchesLeague(m, league));

      let finalMarkets: AggregatedMarket[] = basketballProps.map(m => {
        const outcomes = JSON.parse(m.outcomes || '["Yes", "No"]');
        const prices = JSON.parse(m.outcomePrices || "[0.5, 0.5]").map((v: string) => parseFloat(v));
        return {
          id: m.id,
          league: league === "all" ? "Basketball" : league || "NBA",
          startTime: m.startDate,
          volume: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0,
          commentCount: Math.floor(Math.random() * 20),
          question: m.question,
          type: "prop",
          homeTeam: { name: "", logo: "" },
          awayTeam: { name: "", logo: "" },
          outcomes,
          outcomePrices: prices
        };
      });

      if (search) {
        const searchLower = search.toLowerCase();
        finalMarkets = finalMarkets.filter(m => m.question.toLowerCase().includes(searchLower));
      }

      const total = finalMarkets.length;
      const start = (page - 1) * pageSize;
      return { markets: finalMarkets.slice(start, start + pageSize), total };
    }
  } catch (error) {
    console.error("Error in fetchBasketballMarkets:", error);
    return { markets: [], total: 0 };
  }
};

export const getMarketOdds = async (marketId: string) => {
  try {
    const res = await fetch(`${GAMMA_API_BASE}/markets/${marketId}`);
    if (!res.ok) return { home: 0.5, away: 0.5 };
    const market: PolymarketMarket = await res.json();
    const prices = JSON.parse(market.outcomePrices || "[0.5, 0.5]");
    return { home: parseFloat(prices[0]), away: parseFloat(prices[1]) };
  } catch (e) {
    return { home: 0.5, away: 0.5 };
  }
};
