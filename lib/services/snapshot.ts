import { db } from "../db";
import { logger } from "../logger";
import { League } from "../../types/domain";
import crypto from "crypto";

export class SnapshotService {
  /**
   * Persists a snapshot of normalized data to the database.
   */
  static async createSnapshot(league: League, payload: any): Promise<void> {
    try {
      const payloadString = JSON.stringify(payload);
      const payloadHash = crypto.createHash("sha256").update(payloadString).digest("hex");

      // Check if a snapshot with the same hash already exists for this league today
      const existing = await db.marketSnapshot.findFirst({
        where: {
          league,
          payloadHash,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (existing) return;

      await db.marketSnapshot.create({
        data: {
          league,
          payload,
          payloadHash,
        },
      });
    } catch (error) {
      logger.error(`Error creating snapshot for ${league}:`, error);
    }
  }

  /**
   * Retrieves the latest valid snapshot for a league.
   */
  static async getLatestSnapshot(league: League): Promise<any | null> {
    try {
      const snapshot = await db.marketSnapshot.findFirst({
        where: { league },
        orderBy: { createdAt: "desc" },
      });

      return snapshot?.payload || null;
    } catch (error) {
      logger.error(`Error fetching latest snapshot for ${league}:`, error);
      return null;
    }
  }
}
