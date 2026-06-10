/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "../context/GameContext";
import { Play, Trash2, Calendar, Trophy, Shield, Users, Compass, Cpu, Target, ChevronDown } from "lucide-react";
import { LEAGUE_INFO } from "../config/seededData";
import { motion } from "framer-motion";

// Helper component for animated counting numbers
const AnimatedCounter = ({ target, duration = 2 }: { target: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(target * easeProgress));

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count}</span>;
};

export default function WelcomePage() {
  const { savesList, loadSave, deleteGame } = useGame();

  const getClubLogoPlaceholder = (clubName: string) => {
    return clubName.charAt(0).toUpperCase();
  };

  const headlineWords = "Take Control of the".split(" ");

  return (
    <main className="min-h-screen bg-fm-navyDark flex flex-col justify-between font-sans text-white overflow-x-hidden">
      {/* 
        ========================================================================
        HERO SECTION
        ========================================================================
      */}
      <section className="relative w-full min-h-[65vh] flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0 bg-fm-navyDark">
          {/* Subtle SVG Pitch Lines Texture */}
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L10 100 M50 0 L50 100 M90 0 L90 100 M0 10 L100 10 M0 50 L100 50 M0 90 L100 90' stroke='%2300E5FF' stroke-width='0.5' fill='none' /%3E%3Ccircle cx='50' cy='50' r='20' stroke='%2300E5FF' stroke-width='0.5' fill='none' /%3E%3C/svg%3E")`,
                 backgroundSize: '300px 300px',
                 backgroundPosition: 'center',
               }} 
          />
          {/* Radial Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--tw-colors-fm-navyDark)_80%)]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          
          {/* Branding Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-fm-purple/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.15)]"
          >
            <div className="w-8 h-8 rounded-full bg-fm-neonCyan flex items-center justify-center font-bold text-fm-navy shadow-[0_0_15px_rgba(0,229,255,0.8)]">
              G
            </div>
            <span className="text-lg font-black tracking-tight uppercase">
              Gaffer<span className="text-fm-neonCyan drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]">IQ</span>
            </span>
          </motion.div>

          {/* Animated Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl">
            {headlineWords.map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="inline-block mr-3 sm:mr-4"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: headlineWords.length * 0.1, duration: 0.5 }}
              className="relative inline-block mt-2"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fm-neonCyan via-white to-fm-neonMagenta">
                Tactical Pitch
              </span>
              {/* Glowing Neon Underline Shimmer */}
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-fm-neonCyan rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,229,255,0.8)]">
                <motion.div 
                  className="w-[30%] h-full bg-white/80 blur-[2px]"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            </motion.div>
          </h1>

          {/* Stat Counters Row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-4 border-y border-white/10 py-6 w-full max-w-2xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-fm-neonCyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"><AnimatedCounter target={96} /></span>
              <span className="text-xs uppercase tracking-widest text-fm-slate font-bold mt-1">Clubs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-fm-neonCyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"><AnimatedCounter target={5} /></span>
              <span className="text-xs uppercase tracking-widest text-fm-slate font-bold mt-1">Leagues</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-fm-neonCyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"><AnimatedCounter target={1000} />+</span>
              <span className="text-xs uppercase tracking-widest text-fm-slate font-bold mt-1">Players</span>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link href="/onboarding/manager">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 py-4 px-10 rounded-xl bg-fm-neonCyan hover:bg-cyan-300 text-fm-navyDark font-black text-lg tracking-wide shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-3 uppercase"
              >
                <Trophy className="w-5 h-5" />
                Start New Career
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.5, duration: 1 },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.65, behavior: 'smooth' })}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-fm-slate">Explore</span>
          <ChevronDown className="w-5 h-5 text-fm-neonCyan opacity-80 drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
        </motion.div>
      </section>

      {/* 
        ========================================================================
        TRADING CARD FEATURES
        ========================================================================
      */}
      <section className="relative z-10 -mt-10 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="glass-card rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-fm-neonCyan/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-fm-neonCyan/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-fm-navyDark w-fit border border-white/10 shadow-inner">
              <Cpu className="w-5 h-5 text-fm-neonCyan drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
            </div>
            <h3 className="font-bold text-white text-lg tracking-wide">Powered by Advanced AI</h3>
            <p className="text-xs text-fm-slate font-medium">Intelligent match engine with deep tactical realism.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="glass-card rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-fm-neonMagenta/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-fm-neonMagenta/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-fm-navyDark w-fit border border-white/10 shadow-inner">
              <Users className="w-5 h-5 text-fm-neonMagenta drop-shadow-[0_0_5px_rgba(233,0,116,0.8)]" />
            </div>
            <h3 className="font-bold text-white text-lg tracking-wide">2026/27 Squad Data</h3>
            <p className="text-xs text-fm-slate font-medium">Authentic rosters, player attributes, and hidden potential across elite leagues.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="glass-card rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-fm-navyDark w-fit border border-white/10 shadow-inner">
              <Target className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            </div>
            <h3 className="font-bold text-white text-lg tracking-wide">Tactical Mastery</h3>
            <p className="text-xs text-fm-slate font-medium">Define complex player roles, team mentalities, and bespoke pressing triggers.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="glass-card rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-amber-500/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-fm-navyDark w-fit border border-white/10 shadow-inner">
              <Compass className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
            </div>
            <h3 className="font-bold text-white text-lg tracking-wide">Immersive Management</h3>
            <p className="text-xs text-fm-slate font-medium">Navigate board expectations, uncover wonderkids, and forge your legacy.</p>
          </motion.div>

        </div>
      </section>

      {/* 
        ========================================================================
        CAREER SAVES
        ========================================================================
      */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
            <Shield className="w-6 h-6 text-fm-neonCyan drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            Your Career Saves
          </h2>
          <span className="text-xs px-3 py-1 rounded-full bg-fm-navyDark border border-white/10 font-bold text-fm-slate">
            {savesList.length} / 3 Slots Used
          </span>
        </div>

        {savesList.length === 0 ? (
          /* Empty State Illustration */
          <div className="w-full glass-card border border-fm-neonCyan/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-6 shadow-inner">
            <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              {/* Simple Dugout / Bench Illustration */}
              <path d="M20 20 L180 20 Q190 20 190 30 L190 110 L10 110 L10 30 Q10 20 20 20 Z" fill="#3D246C" />
              <path d="M15 110 L185 110 L175 40 L25 40 Z" fill="#0A0B10" />
              {/* Seats */}
              <rect x="40" y="60" width="25" height="30" rx="4" fill="#00E5FF" opacity="0.2" />
              <rect x="75" y="60" width="25" height="30" rx="4" fill="#00E5FF" opacity="0.2" />
              <rect x="110" y="60" width="25" height="30" rx="4" fill="#00E5FF" opacity="0.2" />
              <rect x="145" y="60" width="25" height="30" rx="4" fill="#00E5FF" opacity="0.2" />
              {/* Roof */}
              <path d="M5 25 L195 25 L185 10 L15 10 Z" fill="#1A1C29" />
            </svg>
            <div>
              <h4 className="text-lg font-bold text-white tracking-wide">The dugout is empty.</h4>
              <p className="text-sm text-fm-slate mt-2 max-w-[300px]">No saves yet. Your managerial journey starts here. Hit the cyan button above to begin.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savesList.map((save) => {
              const playerClub = save.clubs.find(c => c.id === save.selectedClubId)!;
              const league = LEAGUE_INFO[playerClub.league];

              return (
                <div 
                  key={save.id}
                  className="group flex flex-col p-5 rounded-2xl glass-card hover:bg-fm-purple/40 border border-white/5 hover:border-fm-neonCyan/50 transition-all duration-300 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fm-neonCyan/5 to-fm-neonMagenta/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-slate-100 shadow-md border border-white/10 group-hover:border-fm-neonCyan/50 transition-colors"
                      style={{ 
                        backgroundColor: playerClub.primaryColor,
                        color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor 
                      }}
                    >
                      {getClubLogoPlaceholder(playerClub.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate group-hover:text-fm-neonCyan transition">
                        {save.saveName}
                      </h4>
                      <p className="text-xs text-fm-slate truncate flex items-center gap-1.5 mt-1">
                        <span className="font-semibold text-white">{playerClub.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-[11px] font-bold text-fm-slate bg-fm-navyDark/50 p-3 rounded-lg border border-white/5 mb-5 uppercase tracking-widest">
                    <span 
                      className="flex items-center gap-1.5"
                      style={{ color: league.color }}
                    >
                      <span>{league.emoji}</span> {playerClub.league}
                    </span>
                    <span className="text-fm-slate/50">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-fm-neonCyan" />
                      Matchday {save.currentMatchday}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 mt-auto">
                    <Link 
                      href="/game/dashboard"
                      onClick={() => loadSave(save.id)}
                      className="flex-1 py-2.5 rounded-lg bg-fm-neonCyan hover:bg-cyan-300 text-fm-navyDark border border-transparent font-black text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Load Save
                    </Link>
                    <button 
                      onClick={() => deleteGame(save.id)}
                      className="p-2.5 rounded-lg bg-fm-navy hover:bg-rose-500 text-fm-slate hover:text-white border border-white/5 hover:border-rose-500 transition-all shadow-md"
                      title="Delete Save"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer Info */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-fm-navyDark py-8 px-6 text-xs text-fm-slate">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-fm-slate">
            <div className="w-5 h-5 rounded bg-fm-neonCyan flex items-center justify-center text-fm-navyDark font-black">G</div>
            GafferIQ Simulation Engine
          </div>
          <span>© 2026. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
