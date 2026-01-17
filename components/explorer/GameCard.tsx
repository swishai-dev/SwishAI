"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Game, Prop, PropType } from "../../types/domain";
import { Calendar, Trophy, ChevronRight, BarChart2 } from "lucide-react";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProps() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/games/${game.event_id}/props`);
        const data = await res.json();
        setProps(data.props || []);
      } catch (error) {
        console.error("Failed to fetch props:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProps();
  }, [game.event_id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sr-RS", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPropByType = (type: PropType) => props.find((p) => p.prop_type === type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
      className="w-full mb-4 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-orange-500/30 group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Matchup Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
              {game.league}
            </span>
            <div className="flex items-center text-white/30 text-[10px] font-medium uppercase tracking-wider">
              <Calendar className="w-3 h-3 mr-1.5 opacity-50" />
              {formatDate(game.start_time)}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg shadow-inner">🏀</div>
               <span className="text-[10px] text-white/20 font-bold uppercase">Away</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl md:text-2xl font-black text-white truncate group-hover:text-orange-500 transition-colors">
                {game.home_team} <span className="text-white/10 font-light mx-2">vs</span> {game.away_team}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg shadow-inner">🏀</div>
               <span className="text-[10px] text-white/20 font-bold uppercase">Home</span>
            </div>
          </div>
        </div>

        {/* Odds Section */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-24 h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Moneyline */}
                {getPropByType(PropType.MONEYLINE) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest ml-1">Moneyline</span>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      <div className="px-3 py-1.5 text-xs font-black text-orange-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">ML</div>
                    </div>
                  </div>
                )}

                {/* Spread */}
                {getPropByType(PropType.SPREAD) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest ml-1">Spread</span>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      <div className="px-3 py-1.5 text-xs font-black text-blue-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">SPR</div>
                    </div>
                  </div>
                )}

                {/* Totals */}
                {getPropByType(PropType.TOTALS) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest ml-1">Total</span>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      <div className="px-3 py-1.5 text-xs font-black text-purple-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">O/U</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>

          <div className="h-12 w-px bg-white/5 mx-2 hidden lg:block" />

          <button 
            onClick={onClick}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,102,0,0.4)] transition-all flex items-center gap-2 active:scale-95"
          >
            <BarChart2 className="w-4 h-4" />
            Analyze
          </button>
        </div>
      </div>
    </motion.div>
  );
};
