export interface PolymarketEvent {
  id: string;
  ticker: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  lastUpdated: string;
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
  sortBy: string;
  category: string;
  slug: string;
  tags?: PolymarketTag[];
  markets: PolymarketMarket[];
  commentCount: number;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  twitterId: string;
  resolutionSource: string;
  endDate: string;
  startDate: string;
  image: string;
  icon: string;
  category: string;
  groupItemTitle: string;
  groupItemOrder: number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: string;
  volume: string;
  outcomes: string; // JSON string
  outcomePrices: string; // JSON string
  clobTokenIds: string; // JSON string
  proxyType: string;
}

export interface PolymarketTag {
  id: number;
  label: string;
  slug: string;
}
