"use client";

interface MetricsDisplayProps {
  predictedProbability: number;
  marketImplied: number;
  edge: number;
  label?: string;
}

export default function MetricsDisplay({
  predictedProbability,
  marketImplied,
  edge,
  label = "Predicted",
}: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="reveal-prob reveal-item glass p-4 text-center border-neon-blue/20">
        <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{label}</span>
        <span className="text-4xl font-black font-mono text-neon-blue">
          {(predictedProbability * 100).toFixed(1)}%
        </span>
      </div>

      <div className="reveal-odds reveal-item glass p-4 text-center border-white/5">
        <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Market Implied</span>
        <span className="text-4xl font-black font-mono text-white">
          {(marketImplied * 100).toFixed(1)}%
        </span>
      </div>

      <div className="reveal-edge reveal-item glass p-4 text-center border-neon-green/20">
        <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Detected Edge</span>
        <span className="text-4xl font-black font-mono text-neon-green">
          {edge > 0 ? "+" : ""}{(edge * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
