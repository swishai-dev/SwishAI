import axios from "axios";
import { PolymarketEvent, PolymarketTag } from "../../types/polymarket";

const GAMMA_API_BASE = process.env.GAMMA_API_BASE || "https://gamma-api.polymarket.com";

export class PolymarketService {
  /**
   * Fetches active events from Polymarket Gamma API.
   * Filters by tag_id to isolate specific leagues.
   */
  static async fetchEvents(options: {
    tagId?: number;
    active?: boolean;
    closed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PolymarketEvent[]> {
    const { tagId, active = true, closed = false, limit = 100, offset = 0 } = options;

    try {
      const response = await axios.get(`${GAMMA_API_BASE}/events`, {
        params: {
          tag_id: tagId,
          active,
          closed,
          limit,
          offset,
          order: "startTime",
          ascending: true,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error("Error fetching events from Polymarket:", error);
      throw new Error("FAILED_TO_FETCH_POLYMARKET_EVENTS");
    }
  }

  /**
   * Fetches specific tags to discover league IDs.
   */
  static async fetchTags(search?: string): Promise<PolymarketTag[]> {
    try {
      const response = await axios.get(`${GAMMA_API_BASE}/tags`, {
        params: {
          search,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tags from Polymarket:", error);
      return [];
    }
  }

  /**
   * Fetches specific sports metadata to get current series_ids/tag_ids.
   */
  static async fetchSportsMetadata(): Promise<any[]> {
    try {
      const response = await axios.get(`${GAMMA_API_BASE}/sports`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching sports metadata:", error);
      return [];
    }
  }

  /**
   * Fetches a single event by ID.
   */
  static async fetchEventById(id: string): Promise<PolymarketEvent | null> {
    try {
      const response = await axios.get(`${GAMMA_API_BASE}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id} from Polymarket:`, error);
      return null;
    }
  }
}
