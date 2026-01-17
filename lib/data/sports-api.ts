import axios from "axios";

const SPORTS_API_URL = "https://api.example.com/v1/basketball";
const API_KEY = process.env.SPORTS_API_KEY;

export interface TeamStats {
  id: string;
  name: string;
  recentForm: string[];
  injuries: string[];
  offenseRating: number;
  defenseRating: number;
  wins: number;
  losses: number;
  logoUrl: string;
}

export const fetchTeamStats = async (teamId: string): Promise<TeamStats> => {
  // Simulate API call with deterministic but realistic data
  const isLakers = teamId.toLowerCase().includes("lakers");
  const name = isLakers ? "LA Lakers" : teamId;
  
  return {
    id: teamId,
    name,
    recentForm: ["W", "W", "L", "W", "W"],
    injuries: isLakers ? ["Anthony Davis (Probable)"] : [],
    offenseRating: 115.5,
    defenseRating: 110.2,
    wins: Math.floor(Math.random() * 20) + 10,
    losses: Math.floor(Math.random() * 20) + 10,
    logoUrl: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`
  };
};

export const fetchMatchupContext = async (homeTeamId: string, awayTeamId: string) => {
  const homeStats = await fetchTeamStats(homeTeamId);
  const awayStats = await fetchTeamStats(awayTeamId);
  
  return {
    homeStats,
    awayStats,
    h2h: "Lakers lead 3-2 in last 5 meetings",
    schedule: "Back-to-back for Lakers, Celtics had 2 days rest",
  };
};
