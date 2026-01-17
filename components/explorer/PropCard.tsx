"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Activity, TrendingUp } from "lucide-react";

interface PropCardProps {
  id: string;
  league: string;
  startTime: string;
  volume: number;
  commentCount: number;
  question: string;
  outcomes?: string[];
  outcomePrices?: number[];
}

const formatVolume = (vol: number) => {
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}m`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}k`;
  return `$${vol.toFixed(0)}`;
};

const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
};

export default function PropCard({
  id,
  league,
  startTime,
  volume,
  commentCount,
  question,
  outcomes = ["Yes", "No"],
  outcomePrices = [0.5, 0.5],
}: PropCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="glass border border-zinc-800/50 hover:border-zinc-700 transition-all rounded-xl p-5 group flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase text-neon-blue tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
            {league}
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">{formatDate(startTime)}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatVolume(volume)}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {commentCount}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-zinc-600" />
        </div>
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
          {question}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {outcomes.map((outcome, idx) => (
          <div
            key={outcome}
            className={`flex flex-col gap-1 p-2 rounded-lg border ${
              idx === 0 
                ? "bg-green-600/10 border-green-600/20 text-green-400" 
                : "bg-red-600/10 border-red-600/20 text-red-400"
            }`}
          >
            <span className="text-[9px] font-black uppercase opacity-70">{outcome}</span>
            <span className="text-lg font-mono font-bold">
              {Math.round((outcomePrices[idx] || 0.5) * 100)}¢
            </span>
          </div>
        ))}
      </div>

      <Link
        href={`/matchup/${id}`}
        className="mt-2 block w-full py-2.5 rounded-lg bg-white/5 border border-zinc-800 text-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-black hover:border-orange-600 transition-all"
      >
        AI Analysis
      </Link>
    </motion.div>
  );
}
