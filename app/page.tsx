"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";

// Register Flip plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

// NBA team logos - all 30 teams
const nbaImages = [
  // Eastern Conference - Atlantic
  "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg", // Boston Celtics
  "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg", // Brooklyn Nets
  "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg", // New York Knicks
  "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg", // Philadelphia 76ers
  "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg", // Toronto Raptors
  
  // Eastern Conference - Central
  "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg", // Chicago Bulls
  "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg", // Cleveland Cavaliers
  "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg", // Detroit Pistons
  "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg", // Indiana Pacers
  "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg", // Milwaukee Bucks
  
  // Eastern Conference - Southeast
  "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg", // Atlanta Hawks
  "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg", // Charlotte Hornets
  "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg", // Miami Heat
  "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg", // Orlando Magic
  "https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg", // Washington Wizards
  
  // Western Conference - Northwest
  "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg", // Denver Nuggets
  "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg", // Minnesota Timberwolves
  "https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg", // Oklahoma City Thunder
  "https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg", // Portland Trail Blazers
  "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg", // Utah Jazz
  
  // Western Conference - Pacific
  "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg", // Golden State Warriors
  "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg", // LA Clippers
  "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg", // Los Angeles Lakers
  "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg", // Phoenix Suns
  "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg", // Sacramento Kings
  
  // Western Conference - Southwest
  "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg", // Dallas Mavericks
  "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg", // Houston Rockets
  "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg", // Memphis Grizzlies
  "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg", // New Orleans Pelicans
  "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg", // San Antonio Spurs
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState({ seconds: 24, centiseconds: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const animateImagesFnRef = useRef<(() => void) | null>(null);

  // Check if we should skip loading (from navigation, not initial load)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const skipLoading = sessionStorage.getItem("skipLoading");
      if (skipLoading === "true") {
        sessionStorage.removeItem("skipLoading");
        setIsLoading(false);
      }
    }
  }, []);

  // Counter animation - counts down from 24 to 0 (basketball shot clock style)
  // Shows centiseconds when below 5 seconds
  useEffect(() => {
    if (!isLoading) return;

    const duration = 7200; // 7.2 seconds total (slower countdown)
    const startTime = Date.now();
    let hasTriggeredAnimation = false;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Count down from 24.00 to 0.00
      const totalSeconds = 24 - (progress * 24);
      const seconds = Math.max(0, Math.floor(totalSeconds));
      const centiseconds = Math.max(0, Math.floor((totalSeconds - seconds) * 100));
      
      setCounter({ seconds, centiseconds });

      // When counter reaches 0, trigger image animation
      if (seconds === 0 && centiseconds === 0 && !hasTriggeredAnimation) {
        hasTriggeredAnimation = true;
        
        // Fade out counter
        if (counterRef.current) {
          gsap.to(counterRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
          });
        }

        // Trigger image animation to bottom-right
        if (animateImagesFnRef.current) {
          setTimeout(() => {
            animateImagesFnRef.current?.();
            
            // Fade out loader after images finish animating
            setTimeout(() => {
              if (loaderRef.current) {
                gsap.to(loaderRef.current, {
                  opacity: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  onComplete: () => setIsLoading(false),
                });
              }
            }, 1200);
          }, 300);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isLoading]);

  // Loading animation timeline with Flip
  useEffect(() => {
    if (!loaderRef.current || !imagesContainerRef.current) return;

    const ctx = gsap.context(() => {
      const images = imagesContainerRef.current?.querySelectorAll(".loader-img");
      if (!images || images.length === 0) return;

      // Set initial states - images start off-screen, will animate in one by one
      const totalDuration = 7.2; // Match counter duration
      const staggerDelay = totalDuration / images.length; // Distribute over counter duration
      
      images.forEach((img, index) => {
        gsap.set(img, {
          scale: 0.9,
          opacity: 0,
          top: "1.5rem",
          left: "1.5rem",
          x: 0,
          y: 0,
          rotation: 0,
          clipPath: "inset(50% 50% 50% 50% round 16px)",
          zIndex: index + 1, // Newer images stack on top
        });
      });

      gsap.set(".loader-bg", { opacity: 0 });

      const tl = gsap.timeline();

      // Background fade in (no scale animation)
      tl.to(".loader-bg", {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });

      // Images animate in one by one and stack on top of each other
      // Shape-reveal transition (PowerPoint-like)
      images.forEach((img, index) => {
        tl.to(
          img,
          {
            clipPath: "inset(0% 0% 0% 0% round 16px)",
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          index * staggerDelay
        );
      });

      // Function to animate images to bottom-right using Flip
      const animateImagesToBottomRight = () => {
        // Get current state before moving
        const state = Flip.getState(images);

        // Set new positions - move to bottom-right corner
        images.forEach((img) => {
          gsap.set(img, {
            top: "auto",
            left: "auto",
            bottom: "1.5rem",
            right: "1.5rem",
          });
        });

        // Animate with Flip - this creates the diagonal slide effect
        Flip.from(state, {
          duration: 1,
          stagger: 0.1,
          ease: "power3.inOut",
        });

        // Scale animation for each image during the transition
        images.forEach((img, index) => {
          const scaleTimeline = gsap.timeline();
          scaleTimeline
            .to(
              img,
              {
                scale: 2.5,
                duration: 0.45,
                ease: "power3.in",
              },
              0.025
            )
            .to(
              img,
              {
                scale: 1,
                duration: 0.45,
                ease: "power3.out",
              },
              0.5
            );
        });
      };

      // Store animateImagesToBottomRight function in ref for later use
      animateImagesFnRef.current = animateImagesToBottomRight;
    }, loaderRef);

    return () => ctx.revert();
  }, []);

  // Content reveal animation after loading
  useEffect(() => {
    if (isLoading || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set([".reveal-item", ".feature-card", ".bottom-section"], {
        y: 20,
        opacity: 0,
      });

      gsap.to([".reveal-item", ".feature-card", ".bottom-section"], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
      });
    }, contentRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Loading Screen */}
      <div
        ref={loaderRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        style={{ display: isLoading ? "flex" : "none" }}
      >
        {/* Animated background - solid black */}
        <div
          className="loader-bg absolute inset-0 bg-black"
        />

        {/* Images container - positioned absolutely */}
        <div
          ref={imagesContainerRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          {nbaImages.map((src, index) => (
            <div
              key={index}
              className="loader-img absolute rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: "20%",
                aspectRatio: "5/3",
                top: "1.5rem",
                left: "1.5rem",
                zIndex: 10 + index,
                backgroundColor: "#000000",
              }}
            >
              <img
                src={src}
                alt={`NBA Team ${index + 1}`}
                className="w-full h-full object-contain p-4"
                style={{ 
                  filter: "brightness(1.1) contrast(1.2)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Counter - Basketball shot clock DS-Digital style */}
        <div
          ref={counterRef}
          className="relative z-20 flex items-center justify-center"
          style={{
            position: "fixed",
            right: "3rem",
            bottom: "2rem",
          }}
        >
          <div
            className="text-[10rem] md:text-[16rem] font-mono text-red-500 leading-none"
            style={{
              fontFamily: "'DS-Digital', var(--font-orbitron), 'Courier New', monospace",
              fontWeight: 700,
              textShadow: `
                0 0 10px rgba(255, 0, 0, 0.8),
                0 0 20px rgba(255, 0, 0, 0.6),
                0 0 30px rgba(255, 0, 0, 0.4),
                0 0 40px rgba(255, 0, 0, 0.2),
                0 0 5px rgba(255, 0, 0, 1),
                inset 0 0 10px rgba(255, 0, 0, 0.3)
              `,
              letterSpacing: "0.05em",
              filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.8))",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "inline-block", width: "2ch" }}>
              {counter.seconds.toString().padStart(2, "0")}
            </span>
            <span
              style={{
                display: "inline-block",
                width: "3ch",
                textAlign: "left",
                opacity: counter.seconds < 5 ? 0.9 : 0,
              }}
            >
              .{counter.centiseconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* SwishAI branding during load */}
        <div className="absolute bottom-8 left-8 z-20">
          <div className="text-2xl font-black italic text-white/50 uppercase tracking-tight">
            Swish<span className="text-neon-orange/50">AI</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={contentRef}
        className="relative w-full h-full flex flex-col overflow-hidden"
        style={{ visibility: isLoading ? "hidden" : "visible" }}
      >
        {/* Background - solid black */}
        <div className="absolute inset-0 bg-black" />


        {/* Hero Section */}
        <div
          ref={heroRef}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-12"
        >
          {/* Main Title */}
          <div className="text-center mb-8">
            <h1
              className="main-title reveal-item text-6xl md:text-8xl lg:text-[10rem] font-black italic uppercase tracking-tighter text-white mb-4"
              style={{
                letterSpacing: "-0.06em",
              }}
            >
              Swish<span className="text-neon-orange">AI</span>
            </h1>
            <p className="reveal-item text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-2">
              AI-powered analysis for Polymarket basketball prediction markets
            </p>
            <p className="reveal-item text-sm md:text-base text-gray-500 font-medium uppercase tracking-widest">
              Real-time edge detection • Professional insights • Market intelligence
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="reveal-item flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/explorer"
              className="group relative px-12 py-5 bg-neon-orange text-black font-black text-lg rounded-full hover:scale-105 transition-all duration-300 uppercase tracking-wider overflow-hidden"
            >
              <span className="relative z-10">Explore Markets</span>
              <div className="absolute inset-0 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mb-8">
            <div className="feature-card group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02]">
              <div className="text-4xl font-black text-neon-orange/80 mb-3">01</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">AI Analysis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Deep learning models analyze NBA data in real-time
              </p>
            </div>

            <div className="feature-card group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02]">
              <div className="text-4xl font-black text-blue-400/80 mb-3">02</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Edge Detection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Identify value by comparing market odds against AI probabilities
              </p>
            </div>

            <div className="feature-card group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02]">
              <div className="text-4xl font-black text-emerald-400/80 mb-3">03</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Market Intel</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional-grade reports with confidence scores & recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Social Links */}
        <div className="bottom-section relative z-10 w-full px-6 md:px-12 py-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
