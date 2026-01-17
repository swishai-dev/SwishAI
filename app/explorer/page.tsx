"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bookmark, 
  TrendingUp, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Flame,
  Trophy,
  Calendar
} from "lucide-react";
import type { NBAGame, NBAProp } from "@/lib/services/nba";

type TabType = "games" | "props";

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("games");
  const [search, setSearch] = useState("");
  const [games, setGames] = useState<NBAGame[]>([]);
  const [props, setProps] = useState<NBAProp[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = activeTab === "games" ? 10 : 9;
  
  
  // Analysis modal
  const [analysisModal, setAnalysisModal] = useState<{
    open: boolean;
    type: "game" | "prop";
    data: any;
    analysis: string | null;
    loading: boolean;
  }>({ open: false, type: "game", data: null, analysis: null, loading: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nba?type=all&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setGames(data.games || []);
      setProps(data.props || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  // Reset pagination on search or tab change
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const analyzeData = async (type: "game" | "prop", data: any) => {
    setAnalysisModal({ open: true, type, data, analysis: null, loading: true });
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      const result = await res.json();
      
      if (result.error) {
        setAnalysisModal((prev) => ({ ...prev, analysis: `Error: ${result.error}`, loading: false }));
      } else {
        setAnalysisModal((prev) => ({ ...prev, analysis: result.analysis, loading: false }));
      }
    } catch (error) {
      setAnalysisModal((prev) => ({ ...prev, analysis: "Failed to generate analysis.", loading: false }));
    }
  };

  const formatPrice = (price: number) => `${Math.round(price * 100)}¢`;
  
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    
    if (isToday) return `Today ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    if (isTomorrow) return `Tomorrow ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  // Current items based on tab
  const currentItems = activeTab === "games" ? games : props;
  const paginatedItems = currentItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-4">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Swish<span className="text-neon-orange">AI</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* NBA Markets Title */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            NBA <span className="text-neon-orange">Markets</span>
          </h2>
          <p className="text-base text-gray-400 font-medium">Live Polymarket Data</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams, markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/60 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Animated Tab Switch */}
        <div className="flex justify-center mb-8">
          <div className="relative bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex gap-1">
              {[
                { id: "games" as TabType, label: "Games", icon: Flame, count: games.length, color: "from-orange-500 to-red-500" },
                { id: "props" as TabType, label: "Props", icon: Trophy, count: props.length, color: "from-purple-500 to-pink-500" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white/20" : "bg-white/5"
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>


        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <Loader2 className="relative w-10 h-10 animate-spin text-orange-500" />
            </div>
            <p className="mt-4 text-gray-500 text-sm">Loading markets...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Games Tab Content */}
            {activeTab === "games" && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[1fr_130px_130px_130px_80px_100px] gap-3 px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Matchup
                    </div>
                    <div className="text-center">Moneyline</div>
                    <div className="text-center text-blue-400">Spread</div>
                    <div className="text-center text-emerald-400">Total</div>
                    <div className="text-center">Vol</div>
                    <div></div>
                  </div>

                  {/* Games List */}
                  <div className="divide-y divide-white/5">
                    {(paginatedItems as NBAGame[]).length === 0 ? (
                      <div className="py-20 text-center">
                        <Flame className="w-12 h-12 mx-auto mb-4 text-orange-500/30" />
                        <p className="text-gray-500">No upcoming games found</p>
                        <p className="text-gray-600 text-sm mt-1">Check back later for new matchups</p>
                      </div>
                    ) : (
                      (paginatedItems as NBAGame[]).map((game, idx) => (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="grid grid-cols-1 lg:grid-cols-[1fr_130px_130px_130px_80px_100px] gap-3 px-5 py-4 hover:bg-white/[0.02] transition-all group"
                        >
                          {/* Matchup */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-orange-400/80 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(game.startTime)}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-lg">{game.awayTeam}</span>
                              <span className="text-orange-500 font-bold text-sm">VS</span>
                              <span className="font-bold text-white text-lg">{game.homeTeam}</span>
                            </div>
                          </div>

                          {/* Moneyline */}
                          <div className="flex flex-col gap-1.5 justify-center">
                            {game.moneyline ? (
                              <>
                                <button className="bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-all text-orange-300">
                                  {formatPrice(game.moneyline.away.price)}
                                </button>
                                <button className="bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-all text-orange-300">
                                  {formatPrice(game.moneyline.home.price)}
                                </button>
                              </>
                            ) : (
                              <div className="text-gray-600 text-center py-4">—</div>
                            )}
                          </div>

                          {/* Spread */}
                          <div className="flex flex-col gap-1.5 justify-center">
                            {game.spread ? (
                              <>
                                <button className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                  <span className="text-blue-400">+{Math.abs(parseFloat(game.spread.line))}</span>
                                  <span className="text-white">{formatPrice(game.spread.away)}</span>
                                </button>
                                <button className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                  <span className="text-blue-400">{game.spread.line}</span>
                                  <span className="text-white">{formatPrice(game.spread.home)}</span>
                                </button>
                              </>
                            ) : (
                              <div className="text-gray-600 text-center py-4">—</div>
                            )}
                          </div>

                          {/* Total */}
                          <div className="flex flex-col gap-1.5 justify-center">
                            {game.total ? (
                              <>
                                <button className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                  <span className="text-emerald-400">O {game.total.line}</span>
                                  <span className="text-white">{formatPrice(game.total.over)}</span>
                                </button>
                                <button className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                  <span className="text-emerald-400">U {game.total.line}</span>
                                  <span className="text-white">{formatPrice(game.total.under)}</span>
                                </button>
                              </>
                            ) : (
                              <div className="text-gray-600 text-center py-4">—</div>
                            )}
                          </div>

                          {/* Volume */}
                          <div className="flex items-center justify-center">
                            <span className="text-[11px] text-gray-500 font-medium">{formatVolume(game.volume)}</span>
                          </div>

                          {/* Analyze */}
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => analyzeData("game", game)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Analyze
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Props Tab Content */}
            {activeTab === "props" && (
              <motion.div
                key="props"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {(paginatedItems as NBAProp[]).length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-500/30" />
                    <p className="text-gray-500">No props found</p>
                  </div>
                ) : (
                  (paginatedItems as NBAProp[]).map((prop, idx) => (
                    <motion.div
                      key={prop.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-black/30 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10"
                    >
                      {prop.image && (
                        <div className="h-32 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30" />
                          <img 
                            src={prop.image} 
                            alt={prop.question}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-white text-sm line-clamp-2 pr-2 group-hover:text-purple-300 transition-colors">
                            {prop.question}
                          </h3>
                          <Bookmark className="w-4 h-4 text-gray-600 hover:text-purple-400 cursor-pointer transition-colors flex-shrink-0" />
                        </div>

                        <div className="space-y-2 mb-4">
                          {prop.outcomes.slice(0, 3).map((outcome, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 rounded-xl p-2.5 border border-white/5">
                              <span className="text-[11px] text-gray-300 truncate mr-2 flex-1">{outcome.name}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[11px] font-bold text-purple-300 min-w-[36px] text-right">
                                  {Math.round(outcome.price * 100)}%
                                </span>
                                <button className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-bold hover:bg-emerald-500/30 transition-colors border border-emerald-500/20">
                                  Yes
                                </button>
                                <button className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-[9px] font-bold hover:bg-red-500/30 transition-colors border border-red-500/20">
                                  No
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                            <span>{formatVolume(prop.volume)} Vol</span>
                          </div>
                          <button
                            onClick={() => analyzeData("prop", prop)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                          >
                            <Sparkles className="w-3 h-3" />
                            Analyze
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                      page === pageNum
                        ? activeTab === "games"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </main>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analysisModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setAnalysisModal({ ...analysisModal, open: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className={`p-5 border-b border-white/10 bg-gradient-to-r ${
                analysisModal.type === "game" 
                  ? "from-orange-500/10 to-red-500/10" 
                  : "from-purple-500/10 to-pink-500/10"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                      analysisModal.type === "game" 
                        ? "from-orange-500 to-red-500" 
                        : "from-purple-500 to-pink-500"
                    } shadow-lg`}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">AI Analysis</h3>
                      <p className="text-[11px] text-gray-400">Gemini Flash 2.0</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalysisModal({ ...analysisModal, open: false })}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                {/* Data Summary */}
                <div className={`rounded-xl p-4 mb-4 border ${
                  analysisModal.type === "game"
                    ? "bg-orange-500/5 border-orange-500/20"
                    : "bg-purple-500/5 border-purple-500/20"
                }`}>
                  {analysisModal.type === "game" && analysisModal.data && (
                    <div>
                      <div className={`flex items-center gap-3 text-lg font-bold ${
                        analysisModal.type === "game" ? "text-orange-400" : "text-purple-400"
                      }`}>
                        <span>{analysisModal.data.awayTeam}</span>
                        <span className="text-orange-500/60 text-sm">VS</span>
                        <span>{analysisModal.data.homeTeam}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(analysisModal.data.startTime)}
                      </div>
                    </div>
                  )}
                  {analysisModal.type === "prop" && analysisModal.data && (
                    <div className="text-purple-300 font-bold">{analysisModal.data.question}</div>
                  )}
                </div>

                {/* Analysis */}
                {analysisModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse ${
                        analysisModal.type === "game" ? "bg-orange-500" : "bg-purple-500"
                      }`} />
                      <Loader2 className={`relative w-10 h-10 animate-spin ${
                        analysisModal.type === "game" ? "text-orange-500" : "text-purple-500"
                      }`} />
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">Generating analysis...</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {analysisModal.analysis}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
