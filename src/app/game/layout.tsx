/* eslint-disable */
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useGame } from "../../context/GameContext";
import { 
  Trophy, LayoutDashboard, Users, Shield, Calendar, Table, 
  ArrowLeftRight, Search, TrendingUp, User, LogOut, ChevronRight, Play, Mail,
 Building, GraduationCap, Landmark} from 'lucide-react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSave, advanceToNextMatchday, exitToMainMenu } = useGame();

  useEffect(() => {
    if (!activeSave) {
      router.push("/");
    }
  }, [activeSave, router]);

  if (!activeSave) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">
        <div className="animate-pulse font-medium text-slate-400">Loading career save game...</div>
      </div>
    );
  }

  const handleExit = () => {
    exitToMainMenu();
    router.push("/");
  };

  if (activeSave.isGameOver) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-black text-rose-500 mb-4 uppercase tracking-tighter">Sacked!</h1>
        <p className="text-xl text-slate-300 max-w-lg text-center mb-10">
          The Board of Directors have lost all confidence in your ability to manage the club. Your contract has been terminated immediately.
        </p>
        <button onClick={handleExit} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-xl border border-slate-700">
          Return to Main Menu
        </button>
      </div>
    );
  }

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const currentFixture = activeSave.fixtures.find(
    f => f.matchday === activeSave.currentMatchday && 
    (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  );

  const isMatchPlayed = currentFixture ? currentFixture.played : true;

  const handleAdvance = () => {
    if (!isMatchPlayed) {
      router.push("/game/match");
    } else {
      advanceToNextMatchday();
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/game/dashboard", icon: LayoutDashboard },
    { name: "Inbox", href: "/game/inbox", icon: Mail },
    { name: "Squad", href: "/game/squad", icon: Users },
    { name: "Tactics", href: "/game/tactics", icon: Shield },
    { name: "Fixtures", href: "/game/fixtures", icon: Calendar },
    { name: "League Table", href: "/game/table", icon: Table },
    { name: "Competitions", href: "/game/competitions", icon: Trophy },
    { name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },
      { name: "Finances", href: "/game/finances", icon: Landmark },
    { name: "Scouting", href: "/game/scouting", icon: Search },
    { name: "Development", href: "/game/development", icon: GraduationCap },
    { name: "Board", href: "/game/board", icon: Building },
    { name: "Career", href: "/game/manager-career", icon: User },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-transparent">
      
      {/* ── IMMERSIVE TOP NAVIGATION ── */}
      <header className="flex flex-col z-50">
        {/* Top bar (Status & Actions) */}
        <div className="h-14 bg-fm-navy/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shadow-2xl">
          
          {/* Left: Branding & Club */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-fm-neonCyan animate-neon-cyan rounded-full" />
              <span className="font-black text-white uppercase text-sm tracking-widest">Gaffer<span className="text-fm-neonCyan">IQ</span></span>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-white/10">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-lg"
                style={{ backgroundColor: playerClub.primaryColor, color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor }}
              >
                {playerClub.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-black text-white leading-tight tracking-wide">{playerClub.name}</h4>
                <p className="text-[9px] text-fm-slate font-bold uppercase tracking-widest">{activeSave.manager.firstName} {activeSave.manager.lastName}</p>
              </div>
            </div>
          </div>

          {/* Center: Context & Stats */}
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-fm-slate bg-fm-navyLight/80 px-6 py-2 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-white">Season {activeSave.currentSeason}</span>
              <span className="text-fm-neonCyan">•</span>
              <span className="text-white">Matchday {activeSave.currentMatchday}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span>Budget</span>
              <span className="text-emerald-400 font-black tracking-normal">€{(activeSave.transferBudget / 1000000).toFixed(1)}M</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span>Wage Limit</span>
              <span className="text-white font-black tracking-normal">€{(activeSave.wageBudget / 1000).toFixed(0)}k/wk</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase text-fm-slate hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
            <button
              onClick={handleAdvance}
              className={`px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 ${!isMatchPlayed ? 'bg-fm-neonMagenta text-white hover:bg-pink-500 animate-neon-magenta' : 'bg-fm-neonCyan text-fm-navyDark hover:bg-cyan-300 animate-neon-cyan'}`}
            >
              {!isMatchPlayed ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Match
                </>
              ) : (
                <>
                  Advance
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom bar (Navigation) */}
        <nav className="h-12 bg-fm-navyLight/60 backdrop-blur-md border-b border-white/5 px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide shadow-xl">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${isActive ? 'bg-fm-purple/50 text-fm-neonCyan border-b-2 border-fm-neonCyan shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'text-fm-slate hover:text-white hover:bg-white/5'}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── DYNAMIC CONTENT AREA ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        {/* We rely on the layout wrapper to provide the full-bleed background set in globals.css */}
        <div className="mx-auto w-full max-w-7xl min-h-full flex flex-col">
          {children}
        </div>
      </main>

    </div>
  );
}
