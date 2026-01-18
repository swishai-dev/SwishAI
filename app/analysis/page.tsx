"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Target,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Shield,
  Activity,
  Info,
  ExternalLink,
  Zap,
  Brain,
  Gauge,
  PieChart,
  LineChart,
  Sparkles,
  Award,
  Flame
} from "lucide-react";
import { getNBATeamLogo } from "@/lib/utils/nbaLogos";

interface AnalysisData {
  type: "game" | "prop";
  title: string;
  homeTeam?: string;
  awayTeam?: string;
  question?: string;
  startTime?: string;
  volume?: number;
  moneyline?: any;
  spread?: any;
  total?: any;
  outcomes?: any[];
  image?: string;
}

interface StructuredData {
  confidence?: number;
  edgeScore?: number;
  marketBias?: string;
  recommendedSide?: string;
  recommendedOption?: string;
  recommendationReason?: string;
  keyFactors?: Array<{ label: string; impact: number }>;
  charts?: {
    probabilityComparison?: {
      modelProbability?: number;
      marketImpliedProbability?: number;
    };
    riskDistribution?: Array<{ factor: string; weight: number }>;
  };
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showKeyFactors, setShowKeyFactors] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        setData(parsed);
        fetchAnalysis(parsed);
      } catch (e) {
        setError("Invalid data parameter");
        setLoading(false);
      }
    } else {
      setError("No data provided");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchAnalysis = async (analysisData: AnalysisData) => {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    // Simulate loading steps for better UX
    const steps = [
      { delay: 500, step: 1 },
      { delay: 1500, step: 2 },
      { delay: 2500, step: 3 },
      { delay: 3500, step: 4 },
    ];

    const stepIntervals = steps.map(({ delay, step }) => 
      setTimeout(() => setLoadingStep(step), delay)
    );

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: analysisData.type, 
          data: analysisData 
        }),
      });

      const result = await res.json();

      // Clear step intervals
      stepIntervals.forEach(clearTimeout);

      if (!res.ok) {
        if (result.fallback) {
          setAnalysis(result.fallback);
        } else {
          setError(result.message || result.error || "Failed to generate analysis");
        }
      } else {
        setLoadingStep(5); // Final step
        setTimeout(() => {
          setAnalysis(result.analysis);
          setStructuredData(result.structuredData || null);
          setLoading(false);
        }, 300);
      }
    } catch (err: any) {
      stepIntervals.forEach(clearTimeout);
      setError(err.message || "Network error");
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (data) {
      fetchAnalysis(data);
    }
  };


  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol}`;
  };

  const getPolymarketRecommendation = () => {
    if (!structuredData) return null;
    
    // Find the strongest factor (highest absolute impact)
    let strongestFactor = null;
    if (structuredData.keyFactors && structuredData.keyFactors.length > 0) {
      strongestFactor = structuredData.keyFactors.reduce((prev, current) => 
        Math.abs(current.impact) > Math.abs(prev.impact) ? current : prev
      );
    }
    
    if (data?.type === "game") {
      const side = structuredData.recommendedSide;
      if (!side || side === "none") return null;
      
      let recommendation = "";
      let marketType = "";
      
      if (side === "home" || side === "away") {
        const team = side === "home" ? data.homeTeam : data.awayTeam;
        recommendation = `${team} Moneyline`;
        marketType = "Moneyline";
      } else if (side === "over" || side === "under") {
        recommendation = `Total ${side.toUpperCase()}`;
        marketType = "Total";
      }
      
      return {
        recommendation,
        marketType,
        confidence: structuredData.confidence || 0,
        edgeScore: structuredData.edgeScore || 0,
        marketBias: structuredData.marketBias || "unclear",
        recommendationReason: structuredData.recommendationReason || null,
        strongestFactor: strongestFactor
      };
    } else {
      const option = structuredData.recommendedOption;
      if (!option || option === "none") return null;
      
      return {
        recommendation: option,
        marketType: "Prop",
        confidence: structuredData.confidence || 0,
        edgeScore: structuredData.edgeScore || 0,
        marketBias: structuredData.marketBias || "unclear",
        recommendationReason: structuredData.recommendationReason || null,
        strongestFactor: strongestFactor
      };
    }
  };

  const polymarketRec = getPolymarketRecommendation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a] text-white">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Swish<span className="text-neon-orange">AI</span>
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 min-h-[60vh]"
            >
              {/* Animated Loading Circle */}
              <div className="relative mb-8">
                {/* Outer ring */}
                <div className="w-24 h-24 border-4 border-gray-900 rounded-full" />
                
                {/* Animated ring 1 */}
                <motion.div
                  className={`absolute inset-0 w-24 h-24 border-4 border-transparent ${data?.type === "game" ? "border-t-orange-500" : "border-t-purple-500"} rounded-full`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Animated ring 2 */}
                <motion.div
                  className={`absolute inset-0 w-24 h-24 border-4 border-transparent ${data?.type === "game" ? "border-r-red-500" : "border-r-pink-500"} rounded-full`}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Inner pulsing circle */}
                <motion.div
                  className={`absolute inset-4 ${data?.type === "game" ? "bg-gradient-to-br from-orange-500/20 to-red-500/20" : "bg-gradient-to-br from-purple-500/20 to-pink-500/20"} rounded-full`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className={`w-8 h-8 ${data?.type === "game" ? "text-orange-400" : "text-purple-400"}`} />
                  </motion.div>
                </div>
              </div>

              {/* Loading Messages */}
              <div className="text-center space-y-3 max-w-md">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {loadingStep === 0 && "Initializing Analysis Engine"}
                    {loadingStep === 1 && "Processing Market Data"}
                    {loadingStep === 2 && "Analyzing Statistical Patterns"}
                    {loadingStep === 3 && "Generating AI Insights"}
                    {loadingStep === 4 && "Finalizing Recommendations"}
                    {loadingStep === 5 && "Analysis Complete"}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {loadingStep === 0 && "Connecting to AI analysis system and loading market intelligence framework..."}
                    {loadingStep === 1 && "Extracting key metrics, volume flows, and pricing dynamics from live market data..."}
                    {loadingStep === 2 && "Running statistical models to identify value opportunities and market inefficiencies..."}
                    {loadingStep === 3 && "Applying advanced analytics to generate actionable insights and probability assessments..."}
                    {loadingStep === 4 && "Compiling comprehensive analysis with confidence scores and risk assessments..."}
                    {loadingStep === 5 && "Preparing your personalized market intelligence report..."}
                  </p>
                </motion.div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <motion.div
                      key={step}
                      className={`w-2 h-2 rounded-full ${
                        loadingStep > step ? (data?.type === "game" ? 'bg-orange-500' : 'bg-purple-500') : 
                        loadingStep === step ? (data?.type === "game" ? 'bg-red-500' : 'bg-pink-500') : 
                        'bg-gray-700'
                      }`}
                      animate={loadingStep === step ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>

              {/* Subtle background effect */}
              <div className="absolute inset-0 -z-10">
                {data?.type === "game" ? (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
                  </>
                )}
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Analysis Failed</h2>
              <p className="text-gray-400 text-center max-w-md mb-6 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Market Header - Centered */}
              <div className="relative border-b border-white/10 pb-16 pt-8 text-center overflow-visible">
                {/* Background image for props */}
                {data?.type === "prop" && data?.image && (
                  <div className="absolute inset-0 -z-10">
                    <img 
                      src={data.image} 
                      alt="" 
                      className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />
                  </div>
                )}
                
                {/* Background gradient effects */}
                <div className="absolute inset-0 -z-10">
                  {data?.type === "game" ? (
                    <>
                      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
                      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-3xl" />
                    </>
                  ) : (
                    <>
                      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
                      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl" />
                    </>
                  )}
                </div>
                
                {data?.type === "game" ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-8 w-full max-w-6xl"
                    >
                      {/* Away Team */}
                      <motion.span
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative font-bold text-white text-5xl md:text-7xl lg:text-8xl tracking-tight drop-shadow-lg px-8 py-4 text-right justify-self-end"
                      >
                        {/* Team Logo Background */}
                        {getNBATeamLogo(data?.awayTeam) && (
                          <div className="absolute -left-32 -top-20 -z-10 flex items-center justify-center" style={{ width: '600px', height: '600px' }}>
                            <div className="relative">
                              {/* Gradient Shadow */}
                              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-gray-800/20 to-transparent blur-3xl rounded-full" style={{ width: '600px', height: '600px' }} />
                              <img 
                                src={getNBATeamLogo(data?.awayTeam) || ''} 
                                alt={`${data?.awayTeam} logo`}
                                className="relative object-contain opacity-20 -rotate-12"
                                style={{ width: '600px', height: '600px' }}
                              />
                            </div>
                          </div>
                        )}
                        {data?.awayTeam}
                      </motion.span>
                      <motion.span
                        initial={{ scale: 0, rotate: -180, opacity: 1 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
                        className="text-neon-orange font-black text-4xl md:text-5xl lg:text-6xl justify-self-center opacity-100 relative z-20"
                        style={{ opacity: 1 }}
                      >
                        VS
                      </motion.span>
                      {/* Home Team */}
                      <motion.span
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative font-bold text-white text-5xl md:text-7xl lg:text-8xl tracking-tight drop-shadow-lg px-8 py-4 text-left justify-self-start"
                      >
                        {/* Team Logo Background */}
                        {getNBATeamLogo(data?.homeTeam) && (
                          <div className="absolute -right-32 -top-20 -z-10 flex items-center justify-center" style={{ width: '600px', height: '600px' }}>
                            <div className="relative">
                              {/* Gradient Shadow */}
                              <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-gray-800/20 to-transparent blur-3xl rounded-full" style={{ width: '600px', height: '600px' }} />
                              <img 
                                src={getNBATeamLogo(data?.homeTeam) || ''} 
                                alt={`${data?.homeTeam} logo`}
                                className="relative object-contain opacity-20 rotate-12"
                                style={{ width: '600px', height: '600px' }}
                              />
                            </div>
                          </div>
                        )}
                        {data?.homeTeam}
                      </motion.span>
                    </motion.div>
                    {data?.startTime && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center justify-center gap-3 text-gray-300 text-xl md:text-2xl"
                      >
                        <Clock className="w-6 h-6 md:w-7 md:h-7" />
                        <span className="font-semibold">{new Date(data.startTime).toLocaleString()}</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                    >
                      {data?.question}
                    </motion.h1>
                    {data?.startTime && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-2 text-gray-400 text-base md:text-lg"
                      >
                        <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{new Date(data.startTime).toLocaleString()}</span>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Market Metrics - Polymarket Style - Full Width */}
              {data?.type === "game" && (
                <div className="w-full">
                  <div className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Header Row */}
                    <div className="grid grid-cols-[1fr_160px_160px_160px] gap-6 px-8 py-4 border-b border-white/10 bg-black/20">
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Market</div>
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">Moneyline</div>
                      <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider text-center">Spread</div>
                      <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider text-center">Total</div>
                    </div>

                    {/* Data Rows */}
                    <div className="divide-y divide-white/5">
                      {/* Away Team Row */}
                      <div className="grid grid-cols-[1fr_160px_160px_160px] gap-6 px-8 py-5 hover:bg-white/[0.02] transition-colors">
                        <div className="font-semibold text-white text-lg">{data.awayTeam}</div>
                        {data.moneyline && (
                          <div className="text-center">
                            <div className="inline-block bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 px-4 py-2.5 rounded-lg text-base font-bold text-orange-300 transition-all cursor-pointer">
                              {Math.round(data.moneyline.away.price * 100)}¢
                            </div>
                          </div>
                        )}
                        {data.spread && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 px-4 py-2.5 rounded-lg text-base font-bold transition-all cursor-pointer">
                              <span className="text-blue-400">+{Math.abs(parseFloat(data.spread.line))}</span>
                              <span className="text-white">{Math.round(data.spread.away * 100)}¢</span>
                            </div>
                          </div>
                        )}
                        {data.total && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 px-4 py-2.5 rounded-lg text-base font-bold transition-all cursor-pointer">
                              <span className="text-emerald-400">O {data.total.line}</span>
                              <span className="text-white">{Math.round(data.total.over * 100)}¢</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Home Team Row */}
                      <div className="grid grid-cols-[1fr_160px_160px_160px] gap-6 px-8 py-5 hover:bg-white/[0.02] transition-colors">
                        <div className="font-semibold text-white text-lg">{data.homeTeam}</div>
                        {data.moneyline && (
                          <div className="text-center">
                            <div className="inline-block bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 px-4 py-2.5 rounded-lg text-base font-bold text-orange-300 transition-all cursor-pointer">
                              {Math.round(data.moneyline.home.price * 100)}¢
                            </div>
                          </div>
                        )}
                        {data.spread && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 px-4 py-2.5 rounded-lg text-base font-bold transition-all cursor-pointer">
                              <span className="text-blue-400">{data.spread.line}</span>
                              <span className="text-white">{Math.round(data.spread.home * 100)}¢</span>
                            </div>
                          </div>
                        )}
                        {data.total && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 px-4 py-2.5 rounded-lg text-base font-bold transition-all cursor-pointer">
                              <span className="text-emerald-400">U {data.total.line}</span>
                              <span className="text-white">{Math.round(data.total.under * 100)}¢</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Volume Footer */}
                    {data?.volume && (
                      <div className="px-8 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Volume</span>
                        </div>
                        <span className="text-base font-bold text-gray-300">{formatVolume(data.volume)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Recommendation Dashboard Card */}
              {polymarketRec && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`w-full ${data?.type === "game" ? "bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20" : "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/20"} border rounded-2xl p-6 backdrop-blur-sm mb-6`}
                >
                  <div className="mb-4 flex items-center justify-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-3">
                      <Award className={`w-6 h-6 ${data?.type === "game" ? "text-orange-400" : "text-purple-400"}`} />
                      SWISH AI RECOMMENDS
                    </h3>
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-black text-white flex-1">{polymarketRec.recommendation}</h2>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Confidence</div>
                        <div className={`text-xl font-black ${data?.type === "game" ? "text-orange-400" : "text-purple-400"}`}>{polymarketRec.confidence}%</div>
                      </div>
                      {polymarketRec.edgeScore !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Edge</div>
                          <div className="text-xl font-black text-white">{polymarketRec.edgeScore}/10</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {polymarketRec.recommendationReason && (
                    <div className={`${data?.type === "game" ? "bg-black/20 border-orange-500/20" : "bg-black/20 border-purple-500/20"} border-l-2 pl-4 py-3 mb-4 rounded-r-lg`}>
                      <p className="text-sm text-gray-300 leading-relaxed">{polymarketRec.recommendationReason}</p>
                    </div>
                  )}

                  {/* Key Factors Toggle */}
                  {structuredData?.keyFactors && structuredData.keyFactors.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => setShowKeyFactors(!showKeyFactors)}
                        onMouseEnter={() => setShowKeyFactors(true)}
                        className="w-full flex items-center justify-center gap-3 text-sm font-bold text-white hover:text-opacity-80 transition-colors mb-4 cursor-pointer group"
                      >
                        <Sparkles className={`w-5 h-5 ${data?.type === "game" ? "text-orange-400" : "text-purple-400"} group-hover:scale-110 transition-transform`} />
                        <span className="uppercase tracking-wider">Key Factors</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${data?.type === "game" ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"}`}>
                          {structuredData.keyFactors.length}
                        </span>
                        <motion.div
                          animate={{ rotate: showKeyFactors ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-auto"
                        >
                          <TrendingDown className="w-4 h-4" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showKeyFactors && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                              {structuredData.keyFactors.map((factor, idx) => {
                                const progressPercentage = ((factor.impact + 5) / 10) * 100;
                                const isPositive = factor.impact > 0;
                                const isNegative = factor.impact < 0;
                                
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-black/30 border border-white/10 rounded-xl p-5 min-w-[200px] flex-1 max-w-[280px] hover:bg-black/40 hover:border-white/20 transition-all"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-bold text-white">{factor.label}</span>
                                      <span className={`text-2xl font-black ${
                                        isPositive ? 'text-green-400' : 
                                        isNegative ? 'text-red-400' : 
                                        'text-gray-400'
                                      }`}>
                                        {factor.impact > 0 ? '+' : ''}{factor.impact}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.1 + idx * 0.05 }}
                                        className={`h-full ${
                                          isPositive ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                          isNegative ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                                          'bg-gray-600'
                                        }`}
                                      />
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Analysis Dashboard Sections */}
              {analysis && structuredData?.charts && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Side - Market Intelligence */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 mb-1">
                        <Brain className={`w-5 h-5 ${data?.type === "game" ? "text-orange-400" : "text-purple-400"}`} />
                        Market Intelligence
                      </h2>
                      <p className="text-xs text-gray-500 ml-7">AI-powered analytical insights</p>
                    </div>

                    {/* Market Intelligence - Grid Cards Style */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(() => {
                      // Remove "PART 1 — MARKDOWN ANALYSIS" and similar headers
                      let cleanedAnalysis = analysis
                        .replace(/##\s*PART\s+\d+\s*[—–-]\s*MARKDOWN\s+ANALYSIS/gi, '')
                        .replace(/##\s*PART\s+\d+\s*[—–-]\s*STRUCTURED\s+DATA/gi, '')
                        .replace(/\(JSON\s+ONLY\)/gi, '')
                        .replace(/JSON\s+ONLY/gi, '')
                        .replace(/---+/g, '')
                        .replace(/```json/gi, '')
                        .replace(/```/g, '')
                        .trim();
                      
                      const sections = cleanedAnalysis.split(/\n### |^### /).filter(s => {
                        const trimmed = s.trim();
                        // Filter out section headers that are just "PART 1" etc.
                        return trimmed && !trimmed.match(/^PART\s+\d+/i);
                      });
                      
                      return sections.map((section, sectionIndex) => {
                        const trimmedSection = section.trim();
                        if (!trimmedSection) return null;
                        
                        const sectionLines = trimmedSection.split('\n');
                        let header = sectionLines[0] || '';
                        let content = sectionLines.slice(1).join('\n').trim();
                        
                        if (sectionIndex === 0 && !cleanedAnalysis.startsWith('###')) {
                          header = '';
                          content = trimmedSection;
                        }
                        
                        // Remove "JSON ONLY" and json code blocks from content
                        content = content
                          .replace(/\(JSON\s+ONLY\)/gi, '')
                          .replace(/JSON\s+ONLY/gi, '')
                          .replace(/```json/gi, '')
                          .replace(/```/g, '')
                          .trim();
                        
                        const cleanHeader = header.replace(/^###\s*/, '').trim();
                        // Filter out "PART 1" type headers and "JSON ONLY"
                        if (cleanHeader.match(/^PART\s+\d+/i) || cleanHeader.match(/JSON\s+ONLY/i)) {
                          return null;
                        }
                        
                        const title = cleanHeader.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() || 
                                     (sectionIndex === 0 ? 'Analysis' : 'Section');
                      
                        const getSectionConfig = () => {
                          const lowerTitle = title.toLowerCase();
                          
                          if (lowerTitle.includes('context') || lowerTitle.includes('game context')) {
                            return { icon: Flame, color: 'text-orange-400', accentColor: 'border-orange-500', borderColor: 'border-l-orange-500/50' };
                          }
                          if (lowerTitle.includes('statistical') || lowerTitle.includes('matchup')) {
                            return { icon: LineChart, color: 'text-blue-400', accentColor: 'border-blue-500', borderColor: 'border-l-blue-500/50' };
                          }
                          if (lowerTitle.includes('tactical') || lowerTitle.includes('factors')) {
                            return { icon: Target, color: 'text-purple-400', accentColor: 'border-purple-500', borderColor: 'border-l-purple-500/50' };
                          }
                          if (lowerTitle.includes('market') || lowerTitle.includes('line analysis')) {
                            return { icon: TrendingUp, color: 'text-green-400', accentColor: 'border-green-500', borderColor: 'border-l-green-500/50' };
                          }
                          if (lowerTitle.includes('value') || lowerTitle.includes('opportunit')) {
                            return { icon: DollarSign, color: 'text-emerald-400', accentColor: 'border-emerald-500', borderColor: 'border-l-emerald-500/50' };
                          }
                          if (lowerTitle.includes('risk') || lowerTitle.includes('volatility')) {
                            return { icon: Shield, color: 'text-yellow-400', accentColor: 'border-yellow-500', borderColor: 'border-l-yellow-500/50' };
                          }
                          return { icon: Info, color: 'text-gray-400', accentColor: 'border-gray-500', borderColor: 'border-l-gray-500/50' };
                        };
                      
                        const sectionConfig = getSectionConfig();
                        const lowerTitle = title.toLowerCase();
                        
                        // Filter out unwanted sections
                        if (lowerTitle.includes('confidence') || lowerTitle.includes('synthesis') || lowerTitle.includes('final') || lowerTitle.includes('take')) {
                          return null;
                        }
                      
                        return (
                          <motion.div
                            key={sectionIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * sectionIndex, type: "spring" }}
                            className="bg-black/30 border border-white/5 rounded-2xl p-5 hover:bg-black/40 hover:border-white/10 transition-all hover:shadow-xl hover:shadow-white/5 backdrop-blur-sm"
                          >
                            <div className="mb-4">
                              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                {(() => {
                                  const IconComponent = sectionConfig.icon;
                                  return <IconComponent className={`w-4 h-4 ${sectionConfig.color}`} />;
                                })()}
                                {title}
                              </h4>
                            </div>
                            <div className="space-y-2.5">
                              {content ? content.split('\n').filter(p => p.trim()).map((paragraph, pIndex) => {
                                if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
                                  return (
                                    <div key={pIndex} className="flex items-start gap-2.5 pl-1">
                                      <div className={`${sectionConfig.color} mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-current`} />
                                      <span className="text-gray-300 flex-1 text-xs leading-relaxed">{paragraph.trim().substring(2)}</span>
                                    </div>
                                  );
                                }
                                
                                if (paragraph.match(/^\d+\./)) {
                                  return (
                                    <div key={pIndex} className="flex items-start gap-2.5">
                                      <span className={`${sectionConfig.color} font-bold mt-0.5 flex-shrink-0 text-xs`}>
                                        {paragraph.match(/^\d+/)?.[0]}.
                                      </span>
                                      <span className="text-gray-300 flex-1 text-xs leading-relaxed">{paragraph.replace(/^\d+\.\s*/, '')}</span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <p key={pIndex} className="text-gray-300 text-xs leading-relaxed">
                                    {paragraph}
                                  </p>
                                );
                              }) : (
                                <p className="text-gray-500 text-xs italic">No content available</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                    </div>
                  </div>

                  {/* Right Side - Probability Analysis & Risk Assessment */}
                  <div className="lg:col-span-1 space-y-4">
                    {structuredData.charts.probabilityComparison && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                      className={`${data?.type === "game" ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20" : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"} border rounded-2xl p-6 backdrop-blur-sm`}
                    >
                      <div className="mb-6">
                        <div className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                          <LineChart className="w-4 h-4 text-blue-400" />
                          Probability Analysis
                        </div>
                      </div>
                      
                      {/* Side-by-side Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Model Prediction - Gauge Style */}
                        <div className="relative">
                          <div className="text-center mb-3">
                            <div className="text-3xl font-black text-blue-400 mb-1">{structuredData.charts.probabilityComparison.modelProbability}%</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Model</div>
                          </div>
                          <div className="relative w-full aspect-square">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                              />
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="url(#blueGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (structuredData.charts.probabilityComparison.modelProbability || 0) / 100) }}
                                transition={{ duration: 1.5, delay: 0.8 }}
                              />
                              <defs>
                                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#3b82f6" />
                                  <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>

                        {/* Market Implied - Gauge Style */}
                        <div className="relative">
                          <div className="text-center mb-3">
                            <div className="text-3xl font-black text-green-400 mb-1">{structuredData.charts.probabilityComparison.marketImpliedProbability}%</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Market</div>
                          </div>
                          <div className="relative w-full aspect-square">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                              />
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="url(#greenGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (structuredData.charts.probabilityComparison.marketImpliedProbability || 0) / 100) }}
                                transition={{ duration: 1.5, delay: 0.9 }}
                              />
                              <defs>
                                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Difference Indicator */}
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Variance</span>
                          <span className={`text-sm font-black ${Math.abs((structuredData.charts.probabilityComparison.modelProbability || 0) - (structuredData.charts.probabilityComparison.marketImpliedProbability || 0)) > 10 ? 'text-orange-400' : 'text-gray-400'}`}>
                            {Math.abs((structuredData.charts.probabilityComparison.modelProbability || 0) - (structuredData.charts.probabilityComparison.marketImpliedProbability || 0)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    )}

                    {structuredData.charts.riskDistribution && structuredData.charts.riskDistribution.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="bg-black/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
                      >
                      <div className="mb-6">
                        <div className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                          <Shield className="w-4 h-4 text-yellow-400" />
                          Risk Assessment
                        </div>
                      </div>
                      
                      {/* Risk Tags Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {(() => {
                          const weights = structuredData.charts.riskDistribution.map(r => r.weight || 0);
                          const uniqueWeights = Array.from(new Set(weights)).sort((a, b) => b - a);
                          const topWeight = uniqueWeights[0] ?? 0;
                          const secondWeight = uniqueWeights[1] ?? 0;

                          return structuredData.charts.riskDistribution.map((risk, idx) => {
                            const isTop = (risk.weight || 0) === topWeight && topWeight > 0;
                            const isSecond = (risk.weight || 0) === secondWeight && secondWeight > 0 && !isTop;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1 + idx * 0.1 }}
                              className={`p-3 rounded-xl border ${
                                isTop ? 'bg-red-500/10 border-red-500/30' :
                                isSecond ? 'bg-yellow-500/10 border-yellow-500/30' :
                                'bg-black/20 border-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-white">{risk.factor}</span>
                                <span className={`text-xs font-black ${
                                  isTop ? 'text-red-400' :
                                  isSecond ? 'text-yellow-400' :
                                  'text-gray-400'
                                }`}>
                                  {risk.weight}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${risk.weight || 0}%` }}
                                  transition={{ duration: 0.8, delay: 1.2 + idx * 0.1 }}
                                  className={`h-full ${
                                    isTop ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    isSecond ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                    'bg-gradient-to-r from-gray-600 to-gray-700'
                                  }`}
                                />
                              </div>
                            </motion.div>
                          );
                        });
                        })()}
                      </div>

                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Analysis Dashboard Sections - Fallback if no charts */}
              {analysis && !structuredData?.charts && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 mb-1">
                      <Brain className={`w-5 h-5 ${data?.type === "game" ? "text-orange-400" : "text-purple-400"}`} />
                      Market Intelligence
                    </h2>
                    <p className="text-xs text-gray-500 ml-7">AI-powered analytical insights</p>
                  </div>

                  {/* Market Intelligence - Grid Cards Style */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {(() => {
                      // Remove "PART 1 — MARKDOWN ANALYSIS" and similar headers
                      let cleanedAnalysis = analysis
                        .replace(/##\s*PART\s+\d+\s*[—–-]\s*MARKDOWN\s+ANALYSIS/gi, '')
                        .replace(/##\s*PART\s+\d+\s*[—–-]\s*STRUCTURED\s+DATA/gi, '')
                        .replace(/\(JSON\s+ONLY\)/gi, '')
                        .replace(/JSON\s+ONLY/gi, '')
                        .replace(/---+/g, '')
                        .replace(/```json/gi, '')
                        .replace(/```/g, '')
                        .trim();
                      
                      const sections = cleanedAnalysis.split(/\n### |^### /).filter(s => {
                        const trimmed = s.trim();
                        return trimmed && !trimmed.match(/^PART\s+\d+/i);
                      });
                      
                      return sections.map((section, sectionIndex) => {
                        const trimmedSection = section.trim();
                        if (!trimmedSection) return null;
                        
                        const sectionLines = trimmedSection.split('\n');
                        let header = sectionLines[0] || '';
                        let content = sectionLines.slice(1).join('\n').trim();
                        
                        if (sectionIndex === 0 && !cleanedAnalysis.startsWith('###')) {
                          header = '';
                          content = trimmedSection;
                        }
                        
                        content = content
                          .replace(/\(JSON\s+ONLY\)/gi, '')
                          .replace(/JSON\s+ONLY/gi, '')
                          .replace(/```json/gi, '')
                          .replace(/```/g, '')
                          .trim();
                        
                        const cleanHeader = header.replace(/^###\s*/, '').trim();
                        if (cleanHeader.match(/^PART\s+\d+/i) || cleanHeader.match(/JSON\s+ONLY/i)) {
                          return null;
                        }
                        
                        const title = cleanHeader.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() || 
                                     (sectionIndex === 0 ? 'Analysis' : 'Section');
                      
                        const getSectionConfig = () => {
                          const lowerTitle = title.toLowerCase();
                          
                          if (lowerTitle.includes('context') || lowerTitle.includes('game context')) {
                            return { icon: Flame, color: 'text-orange-400', accentColor: 'border-orange-500', borderColor: 'border-l-orange-500/50' };
                          }
                          if (lowerTitle.includes('statistical') || lowerTitle.includes('matchup')) {
                            return { icon: LineChart, color: 'text-blue-400', accentColor: 'border-blue-500', borderColor: 'border-l-blue-500/50' };
                          }
                          if (lowerTitle.includes('tactical') || lowerTitle.includes('factors')) {
                            return { icon: Target, color: 'text-purple-400', accentColor: 'border-purple-500', borderColor: 'border-l-purple-500/50' };
                          }
                          if (lowerTitle.includes('market') || lowerTitle.includes('line analysis')) {
                            return { icon: TrendingUp, color: 'text-green-400', accentColor: 'border-green-500', borderColor: 'border-l-green-500/50' };
                          }
                          if (lowerTitle.includes('value') || lowerTitle.includes('opportunit')) {
                            return { icon: DollarSign, color: 'text-emerald-400', accentColor: 'border-emerald-500', borderColor: 'border-l-emerald-500/50' };
                          }
                          if (lowerTitle.includes('risk') || lowerTitle.includes('volatility')) {
                            return { icon: Shield, color: 'text-yellow-400', accentColor: 'border-yellow-500', borderColor: 'border-l-yellow-500/50' };
                          }
                          return { icon: Info, color: 'text-gray-400', accentColor: 'border-gray-500', borderColor: 'border-l-gray-500/50' };
                        };
                      
                        const sectionConfig = getSectionConfig();
                        const lowerTitle = title.toLowerCase();
                        
                        // Filter out unwanted sections
                        if (lowerTitle.includes('confidence') || lowerTitle.includes('synthesis') || lowerTitle.includes('final') || lowerTitle.includes('take')) {
                          return null;
                        }
                      
                        return (
                          <motion.div
                            key={sectionIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * sectionIndex, type: "spring" }}
                            className="bg-black/30 border border-white/5 rounded-2xl p-5 hover:bg-black/40 hover:border-white/10 transition-all hover:shadow-xl hover:shadow-white/5 backdrop-blur-sm"
                          >
                            <div className="mb-4">
                              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                {(() => {
                                  const IconComponent = sectionConfig.icon;
                                  return <IconComponent className={`w-4 h-4 ${sectionConfig.color}`} />;
                                })()}
                                {title}
                              </h4>
                            </div>
                            <div className="space-y-2.5">
                              {content ? content.split('\n').filter(p => p.trim()).map((paragraph, pIndex) => {
                                if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
                                  return (
                                    <div key={pIndex} className="flex items-start gap-2.5 pl-1">
                                      <div className={`${sectionConfig.color} mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-current`} />
                                      <span className="text-gray-300 flex-1 text-xs leading-relaxed">{paragraph.trim().substring(2)}</span>
                                    </div>
                                  );
                                }
                                
                                if (paragraph.match(/^\d+\./)) {
                                  return (
                                    <div key={pIndex} className="flex items-start gap-2.5">
                                      <span className={`${sectionConfig.color} font-bold mt-0.5 flex-shrink-0 text-xs`}>
                                        {paragraph.match(/^\d+/)?.[0]}.
                                      </span>
                                      <span className="text-gray-300 flex-1 text-xs leading-relaxed">{paragraph.replace(/^\d+\.\s*/, '')}</span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <p key={pIndex} className="text-gray-300 text-xs leading-relaxed">
                                    {paragraph}
                                  </p>
                                );
                              }) : (
                                <p className="text-gray-500 text-xs italic">No content available</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="w-full mt-12 pt-8 border-t border-white/5">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  This analysis is provided for informational and analytical purposes only. It represents market intelligence and data-driven commentary, not gambling advice or investment recommendations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
