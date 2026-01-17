export enum League {
  NBA = "NBA",
  NCAA = "NCAA",
  EURO = "EURO",
  ALL = "ALL",
}

export enum PropType {
  MONEYLINE = "moneyline",
  SPREAD = "spread",
  TOTALS = "totals",
}

export interface Game {
  event_id: string;
  league: League;
  home_team: string;
  away_team: string;
  start_time: string; // ISO UTC
  event_title: string;
  status: "ACTIVE" | "CLOSED";
}

export interface Prop {
  market_id: string;
  event_id: string;
  prop_type: PropType;
  prop_title: string;
  outcomes: string[];
  current_status: "ACTIVE" | "CLOSED";
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GamesResponse {
  games: Game[];
  pagination: Pagination;
}

export interface PropsResponse {
  event_id: string;
  props: Prop[];
}
