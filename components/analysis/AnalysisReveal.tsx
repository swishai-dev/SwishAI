"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import MetricsDisplay from "@/components/ui/MetricsDisplay";

interface AnalysisRevealProps {
  data: any;
  onComplete?: () => void;
}

export default function AnalysisReveal({ data, onComplete }: AnalysisRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!data) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => onComplete?.()
      });

      // 1. Initial Loading Animation
      tl.to(".reveal-item", { opacity: 0, y: 20, duration: 0 });
      
      tl.to(".loading-bar", { scaleX: 1, duration: 1.5, ease: "power2.inOut" });
      
      // 2. Reveal Insights Step-by-Step
      tl.add(() => setPhase(1));
      tl.to(".reveal-prob", { opacity: 1, y: 0, duration: 0.8, ease: "back.out" });
      
      tl.add(() => setPhase(2));
      tl.to(".reveal-odds", { opacity: 1, y: 0, duration: 0.8, ease: "back.out" }, "+=0.5");
      
      tl.add(() => setPhase(3));
      tl.to(".reveal-edge", { opacity: 1, y: 0, duration: 0.8, ease: "back.out" }, "+=0.5");
      
      tl.add(() => setPhase(4));
      tl.to(".reveal-report", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=0.8");
    }, containerRef);

    return () => ctx.revert();
  }, [data, onComplete]);

  return (
    <div ref={containerRef} className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div className="loading-bar w-full h-full bg-orange-500 origin-left scale-x-0" />
      </div>

      <MetricsDisplay
        predictedProbability={data.predictedProbability}
        marketImplied={data.marketImplied}
        edge={data.edge}
        label={data.type === "prop" ? "Hit Probability" : "Win Probability"}
      />

      <div className="reveal-report reveal-item glass p-6">
        <h4 className="text-orange-500 font-bold mb-4 flex items-center gap-2">
          <span>AI ANALYST INSIGHTS</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-orange-500 animate-ping" />
            <div className="w-1 h-1 rounded-full bg-orange-500 animate-ping delay-75" />
            <div className="w-1 h-1 rounded-full bg-orange-500 animate-ping delay-150" />
          </div>
        </h4>
        <p className="text-zinc-300 leading-relaxed font-light italic">
          "{data.report}"
        </p>
      </div>
    </div>
  );
}
