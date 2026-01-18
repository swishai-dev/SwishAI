"use client";

import React from "react";

interface OddsButtonProps {
  label: string;
  price: string | number;
  active?: boolean;
  color?: "green" | "blue" | "orange" | "red" | "zinc" | "purple";
}

const OddsButton = ({ label, price, active, color = "zinc" }: OddsButtonProps) => {
  const colorClasses = {
    green: "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/40",
    blue: "bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/40",
    orange: "bg-orange-600/20 text-orange-400 border-orange-600/30 hover:bg-orange-600/40",
    red: "bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/40",
    zinc: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50",
    purple: "bg-purple-600/20 text-purple-400 border-purple-600/30 hover:bg-purple-600/40",
  };

  const activeClasses = active ? "ring-2 ring-offset-2 ring-offset-black ring-current" : "";

  return (
    <button
      className={`flex items-center justify-between px-3 py-2 rounded-md border transition-all duration-200 min-w-[100px] sm:min-w-[120px] ${colorClasses[color]} ${activeClasses}`}
    >
      <span className="text-xs font-bold uppercase truncate mr-2">{label}</span>
      <span className="text-sm font-mono font-bold whitespace-nowrap">
        {typeof price === "number" ? `${Math.round(price * 100)}¢` : price}
      </span>
    </button>
  );
};

interface BettingGridProps {
  moneyline?: { home: number; away: number };
  spread?: { home: string; homeOdds: number; away: string; awayOdds: number };
  total?: { over: string; overOdds: number; under: string; underOdds: number };
  homeColor?: "green" | "blue" | "orange" | "red" | "zinc" | "purple";
  awayColor?: "green" | "blue" | "orange" | "red" | "zinc" | "purple";
  homeLabel: string;
  awayLabel: string;
}

export default function BettingGrid({
  moneyline,
  spread,
  total,
  homeColor = "green",
  awayColor = "blue",
  homeLabel,
  awayLabel,
}: BettingGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
      {/* Moneyline */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 hidden sm:block">Moneyline</div>
        {moneyline ? (
          <>
            <OddsButton label={homeLabel} price={moneyline.home} color={homeColor} />
            <OddsButton label={awayLabel} price={moneyline.away} color={awayColor} />
          </>
        ) : (
          <div className="h-20 bg-zinc-900/50 rounded-md border border-zinc-800/50 animate-pulse" />
        )}
      </div>

      {/* Spread */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 hidden sm:block">Spread</div>
        {spread ? (
          <>
            <OddsButton label={spread.home} price={spread.homeOdds} />
            <OddsButton label={spread.away} price={spread.awayOdds} />
          </>
        ) : (
          <div className="h-20 bg-zinc-900/50 rounded-md border border-zinc-800/50 animate-pulse" />
        )}
      </div>

      {/* Total */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 hidden sm:block">Total</div>
        {total ? (
          <>
            <OddsButton label={`O ${total.over}`} price={total.overOdds} />
            <OddsButton label={`U ${total.under}`} price={total.underOdds} />
          </>
        ) : (
          <div className="h-20 bg-zinc-900/50 rounded-md border border-zinc-800/50 animate-pulse" />
        )}
      </div>
    </div>
  );
}
