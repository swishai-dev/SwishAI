"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/shared/Hero";
import AnalysisReveal from "@/components/analysis/AnalysisReveal";
import { useParams } from "next/navigation";

export default function MatchupPage() {
  const params = useParams();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisData(null);
    
    const res = await fetch("/api/analysis", {
      method: "POST",
      body: JSON.stringify({
        marketId: params.id,
        currentOdds: 0.55,
        matchup: "Lakers vs Celtics" // In real case, fetch this info
      }),
    });
    
    const data = await res.json();
    setAnalysisData(data.data);
  };

  return (
    <div className="min-h-screen">
      <Hero />
      
      <main className="max-w-4xl mx-auto p-8 -mt-20 relative z-10">
        <div className="glass p-12 text-center mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
            Lakers <span className="text-zinc-500 text-3xl mx-4">VS</span> Celtics
          </h1>
          <p className="text-zinc-400 font-mono mb-8 uppercase tracking-widest">
            Polymarket ID: {params.id}
          </p>
          
          {!analyzing && (
            <button
              onClick={startAnalysis}
              className="px-12 py-4 bg-orange-500 text-black font-black text-xl rounded-full hover:bg-orange-400 hover:scale-105 transition-all shadow-[0_0_30px_#ff6600]"
            >
              TRIGGER AI ANALYSIS
            </button>
          )}
        </div>

        {analyzing && analysisData && (
          <AnalysisReveal data={analysisData} onComplete={() => console.log("Done")} />
        )}
        
        {analyzing && !analysisData && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-orange-500 font-mono animate-pulse uppercase tracking-widest">
              Consulting Basketball Intelligence...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
