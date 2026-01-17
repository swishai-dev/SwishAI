"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface MarketCardProps {
  id: string;
  matchup: string;
  league: string;
  odds: number;
  startTime?: string;
}

const formatStartTime = (startTime?: string) => {
  if (!startTime) return "TBD";
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MarketCard({ id, matchup, league, odds, startTime }: MarketCardProps) {
  const kickoff = formatStartTime(startTime);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass p-6 flex flex-col gap-4 cursor-pointer group hover:neon-border-orange transition-all duration-300"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-neon-blue uppercase tracking-widest">
            {league}
          </span>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="rounded-full w-2 h-2 bg-orange-500 shadow-[0_0_10px_rgba(255,102,0,0.7)]" />
            {kickoff}
          </div>
        </div>

        <h3 className="text-2xl font-bold group-hover:neon-text-orange transition-colors">
          {matchup}
        </h3>
      </div>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Market Odds</span>
            <span className="text-3xl font-mono font-bold">{(odds * 100).toFixed(1)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Signal</span>
            <span className="text-sm font-semibold text-zinc-300">Neutral</span>
          </div>
        </div>

        <Link 
          href={`/matchup/${id}`}
          className="px-6 py-3 rounded-lg bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-colors uppercase tracking-widest text-center"
        >
          Analyze
        </Link>
      </div>
    </motion.div>
  );
}
