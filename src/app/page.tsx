/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "../context/GameContext";
import { Play, Trash2, Calendar, Trophy, Shield, Users, Compass, Cpu, Target } from "lucide-react";
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
    <main className="min-h-screen bg-[#090e1a] flex flex-col justify-between font-sans text-white overflow-hidden">
      {/* 
        ========================================================================
        HERO SECTION
        ========================================================================
      */}
      <section className="relative w-full min-h-[65vh] flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0 bg-[#0a0f1e]">
          {/* Subtle SVG Pitch Lines Texture */}
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L10 100 M50 0 L50 100 M90 0 L90 100 M0 10 L100 10 M0 50 L100 50 M0 90 L100 90' stroke='%2322c55e' stroke-width='0.5' fill='none' /%3E%3Ccircle cx='50' cy='50' r='20' stroke='%2322c55e' stroke-width='0.5' fill='none' /%3E%3C/svg%3E")`,
                 backgroundSize: '300px 300px',
                 backgroundPosition: 'center',
               }} 
          />
          {/* Radial Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0f1e_80%)]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          
          {/* Branding Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-[#111827]/80 backdrop-blur-md border border-[#1e2d40] px-4 py-2 rounded-full shadow-lg"
          >
            <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]">
              G
            </div>
            <span className="text-lg font-black tracking-tight uppercase">
              Gaffer<span className="text-[#22c55e]">IQ</span>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Tactical Pitch
              </span>
              {/* Glowing Green Underline Shimmer */}
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#22c55e] rounded-full overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                <motion.div 
                  className="w-[30%] h-full bg-white/50 blur-sm"
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
            className="flex items-center justify-center gap-8 sm:gap-16 mt-4 border-y border-[#1e2d40] py-6 w-full max-w-2xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#22c55e]"><AnimatedCounter target={96} /></span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Clubs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#22c55e]"><AnimatedCounter target={5} /></span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Leagues</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#22c55e]"><AnimatedCounter target={1000} />+</span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Players</span>
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
                className="mt-4 py-4 px-10 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-lg tracking-wide shadow-[0_0_30px_rgba(22,163,74,0.3)] border border-[#22c55e]/50 flex items-center justify-center gap-3 transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Start New Career
              </motion.button>
            </Link>
          </motion.div>
        </div>
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
            className="bg-[#111827] border border-[#22c55e]/30 rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-[#0a0f1e] w-fit border border-[#1e2d40] shadow-inner">
              <Cpu className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="font-bold text-white text-lg">Powered by Claude AI</h3>
            <p className="text-xs text-slate-400 font-medium">Dynamic match commentary & realistic simulated decisions.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-[#111827] border border-[#22c55e]/30 rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-[#0a0f1e] w-fit border border-[#1e2d40] shadow-inner">
              <Users className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="font-bold text-white text-lg">2024/25 Squad Data</h3>
            <p className="text-xs text-slate-400 font-medium">Accurate rosters, potentials, and attributes from 5 major leagues.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-[#111827] border border-[#22c55e]/30 rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-[#0a0f1e] w-fit border border-[#1e2d40] shadow-inner">
              <Target className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="font-bold text-white text-lg">Granular Tactics</h3>
            <p className="text-xs text-slate-400 font-medium">Set precise player roles, pressing traps, and set-piece routines.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-[#111827] border border-[#22c55e]/30 rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="p-2.5 rounded-lg bg-[#0a0f1e] w-fit border border-[#1e2d40] shadow-inner">
              <Compass className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="font-bold text-white text-lg">Global Scouting</h3>
            <p className="text-xs text-slate-400 font-medium">Unearth wonderkids and negotiate complex contract transfers.</p>
          </motion.div>

        </div>
      </section>

      {/* 
        ========================================================================
        CAREER SAVES
        ========================================================================
      */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#1e2d40] pb-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#22c55e]" />
            Your Career Saves
          </h2>
          <span className="text-xs px-3 py-1 rounded-full bg-[#111827] border border-[#1e2d40] font-bold text-slate-400">
            {savesList.length} / 3 Slots Used
          </span>
        </div>

        {savesList.length === 0 ? (
          /* Empty State Illustration */
          <div className="w-full bg-[#111827] border border-[#1e2d40] rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-6 shadow-inner">
            <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              {/* Simple Dugout / Bench Illustration */}
              <path d="M20 20 L180 20 Q190 20 190 30 L190 110 L10 110 L10 30 Q10 20 20 20 Z" fill="#1e2d40" />
              <path d="M15 110 L185 110 L175 40 L25 40 Z" fill="#0a0f1e" />
              {/* Seats */}
              <rect x="40" y="60" width="25" height="30" rx="4" fill="#22c55e" opacity="0.2" />
              <rect x="75" y="60" width="25" height="30" rx="4" fill="#22c55e" opacity="0.2" />
              <rect x="110" y="60" width="25" height="30" rx="4" fill="#22c55e" opacity="0.2" />
              <rect x="145" y="60" width="25" height="30" rx="4" fill="#22c55e" opacity="0.2" />
              {/* Roof */}
              <path d="M5 25 L195 25 L185 10 L15 10 Z" fill="#0f1623" />
            </svg>
            <div>
              <h4 className="text-lg font-bold text-slate-300">The dugout is empty.</h4>
              <p className="text-sm text-slate-500 mt-2 max-w-[300px]">No saves yet. Your managerial journey starts here. Hit the green button above to begin.</p>
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
                  className="group flex flex-col p-5 rounded-2xl bg-[#111827] hover:bg-[#162032] border border-[#1e2d40] hover:border-[#22c55e]/50 transition duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-slate-100 shadow-md border border-white/10"
                      style={{ 
                        backgroundColor: playerClub.primaryColor,
                        color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor 
                      }}
                    >
                      {getClubLogoPlaceholder(playerClub.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate group-hover:text-[#22c55e] transition">
                        {save.saveName}
                      </h4>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-1">
                        <span className="font-semibold">{playerClub.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 bg-[#0a0f1e] p-3 rounded-lg border border-[#1e2d40] mb-5">
                    <span 
                      className="flex items-center gap-1.5"
                      style={{ color: league.color }}
                    >
                      <span>{league.emoji}</span> {playerClub.league}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Matchday {save.currentMatchday}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <Link 
                      href="/game/dashboard"
                      onClick={() => loadSave(save.id)}
                      className="flex-1 py-2.5 rounded-lg bg-[#22c55e]/10 hover:bg-[#22c55e] text-[#22c55e] hover:text-white border border-[#22c55e]/20 hover:border-[#22c55e] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Load Save
                    </Link>
                    <button 
                      onClick={() => deleteGame(save.id)}
                      className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all"
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
      <footer className="w-full border-t border-[#1e2d40] bg-[#0a0f1e] py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <div className="w-5 h-5 rounded bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">G</div>
            GafferIQ Simulation Engine
          </div>
          <span>© 2026. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
