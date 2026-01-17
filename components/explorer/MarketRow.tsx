"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import BettingGrid from "./BettingGrid";

interface TeamInfo {
  name: string;
  wins: number;
  losses: number;
  logo: string;
}

interface MarketRowProps {
  id: string;
  league: string;
  startTime: string;
  volume: number;
  commentCount: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  moneyline?: { home: number; away: number };
  spread?: { home: string; homeOdds: number; away: string; awayOdds: number };
  total?: { over: string; overOdds: number; under: string; underOdds: number };
}

const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
};

const formatVolume = (vol: number) => {
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}m Vol.`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}k Vol.`;
  return `$${vol.toFixed(0)} Vol.`;
};

export default function MarketRow({
  id,
  league,
  startTime,
  volume,
  commentCount,
  homeTeam,
  awayTeam,
  moneyline,
  spread,
  total,
}: MarketRowProps) {
  // Simple deterministic color selection based on team name
  const getTeamColor = (name: string): "green" | "blue" | "orange" | "red" | "zinc" | "purple" => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors: ("green" | "blue" | "orange" | "red" | "zinc" | "purple")[] = ["green", "blue", "orange", "red", "purple"];
    return colors[sum % colors.length];
  };

  const homeColor = getTeamColor(homeTeam.name);
  const awayColor = getTeamColor(awayTeam.name);

  const colorMap = {
    green: { bg: "bg-green-600/20", border: "border-green-600/30", text: "text-green-400" },
    blue: { bg: "bg-blue-600/20", border: "border-blue-600/30", text: "text-blue-400" },
    orange: { bg: "bg-orange-600/20", border: "border-orange-600/30", text: "text-orange-400" },
    red: { bg: "bg-red-600/20", border: "border-red-600/30", text: "text-red-400" },
    zinc: { bg: "bg-zinc-600/20", border: "border-zinc-600/30", text: "text-zinc-400" },
    purple: { bg: "bg-purple-600/20", border: "border-purple-600/30", text: "text-purple-400" },
  };

  const homeStyles = colorMap[homeColor];
  const awayStyles = colorMap[awayColor];

  // Home and Away labels for the ML buttons (abbreviated)
  const homeLabel = homeTeam.name.substring(0, 3).toUpperCase();
  const awayLabel = awayTeam.name.substring(0, 3).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass border border-zinc-800/50 hover:border-zinc-700 transition-colors rounded-xl overflow-hidden group shadow-lg"
    >
      {/* Top Header Row */}
      <div className="px-4 py-2 border-b border-zinc-800/30 flex items-center justify-between text-[11px] font-mono text-zinc-500 bg-zinc-900/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="font-bold text-zinc-300 uppercase tracking-widest">{league}</span>
          </div>
          <span className="font-bold text-zinc-400">{formatDate(startTime)}</span>
          <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-[10px]">{formatVolume(volume)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
             <span className="text-zinc-600 uppercase font-black text-[9px]">Status:</span>
             <span className="text-green-500 font-bold uppercase tracking-tighter">Live Odds</span>
          </div>
          <Link href={`/matchup/${id}`} className="flex items-center gap-1 hover:text-orange-400 transition-colors font-black uppercase text-[10px] tracking-wider">
            Match Insight <span className="text-xs">→</span>
          </Link>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="p-4 flex flex-col lg:flex-row items-center gap-6 overflow-x-auto">
        {/* Teams Section */}
        <div className="flex flex-col gap-4 min-w-[180px] w-full lg:w-auto">
          {/* Home Team */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md ${homeStyles.bg} flex items-center justify-center border ${homeStyles.border} flex-shrink-0`}>
               <span className={`text-[10px] font-bold ${homeStyles.text}`}>{homeLabel}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white leading-tight truncate">{homeTeam.name}</span>
              {homeTeam.wins !== undefined && homeTeam.losses !== undefined && (
                <span className="text-[10px] text-zinc-500 font-mono">{homeTeam.wins}-{homeTeam.losses}</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md ${awayStyles.bg} flex items-center justify-center border ${awayStyles.border} flex-shrink-0`}>
               <span className={`text-[10px] font-bold ${awayStyles.text}`}>{awayLabel}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white leading-tight truncate">{awayTeam.name}</span>
              {awayTeam.wins !== undefined && awayTeam.losses !== undefined && (
                <span className="text-[10px] text-zinc-500 font-mono">{awayTeam.wins}-{awayTeam.losses}</span>
              )}
            </div>
          </div>
        </div>

        {/* Betting Grid Section */}
        <div className="flex-1 w-full min-w-[300px]">
          <BettingGrid
            homeLabel={homeLabel}
            awayLabel={awayLabel}
            homeColor={homeColor}
            awayColor={awayColor}
            moneyline={moneyline}
            spread={spread}
            total={total}
          />
        </div>

        {/* Action Section */}
        <div className="w-full lg:w-auto mt-4 lg:mt-0 lg:pl-4 lg:border-l lg:border-zinc-800/50">
           <Link 
            href={`/matchup/${id}`}
            className="w-full lg:w-auto block text-center px-6 py-3 rounded-lg bg-orange-600/10 border border-orange-600/30 text-orange-400 text-xs font-bold hover:bg-orange-600/20 transition-all uppercase tracking-widest"
          >
            Analyze Matchup
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
