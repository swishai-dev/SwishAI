"use client";

import Hero from "@/components/shared/Hero";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center overflow-hidden">
      {/* 3D Hero Sekcija */}
      <Hero />

      <div className="max-w-4xl mx-auto px-6 text-center -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
            Swish<span className="text-neon-orange">Ai</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 font-light mb-12 max-w-2xl mx-auto">
            Next-generation AI analysis for Polymarket basketball prediction markets. 
            <span className="text-white"> Real-time edge detection. Professional insights.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/explorer"
              className="px-12 py-5 bg-neon-orange text-black font-black text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,102,0,0.5)] uppercase tracking-widest"
            >
              Explore Markets
            </Link>
            
            <a 
              href="https://polymarket.com" 
              target="_blank" 
              className="glass px-12 py-5 text-xl font-bold hover:bg-white/20 transition-all uppercase tracking-widest"
            >
              Polymarket Live
            </a>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 mb-20 text-left">
          <div className="glass p-8">
            <div className="text-neon-blue text-2xl mb-4">01</div>
            <h3 className="text-xl font-bold mb-2 uppercase">AI Ingestion</h3>
            <p className="text-zinc-500 text-sm">Automated analysis of NBA, EuroLeague, and NCAA data points.</p>
          </div>
          <div className="glass p-8">
            <div className="text-neon-orange text-2xl mb-4">02</div>
            <h3 className="text-xl font-bold mb-2 uppercase">Edge Detection</h3>
            <p className="text-zinc-500 text-sm">Find discrepancies between market odds and true AI probability.</p>
          </div>
          <div className="glass p-8">
            <div className="text-neon-green text-2xl mb-4">03</div>
            <h3 className="text-xl font-bold mb-2 uppercase">Simulated Replay</h3>
            <p className="text-zinc-500 text-sm">Experience the AI thinking process with our high-fidelity reveal engine.</p>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full" />
      </div>
    </main>
  );
}
