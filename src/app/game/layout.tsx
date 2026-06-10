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
    { name: "Home", href: "/game/dashboard", icon: LayoutDashboard },
    { name: "Squad", href: "/game/squad", icon: Users },
    // Center button will be Play/Advance
    { name: "Inbox", href: "/game/inbox", icon: Mail },
    { name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },
  ];

  return (
    <div className="bg-black min-h-screen w-full flex items-center justify-center font-sans">
      
      {/* ── MOBILE SHELL ── */}
      <div className="w-full max-w-md h-[100dvh] bg-[#0f172a] relative flex flex-col shadow-2xl overflow-hidden border-x border-white/5">
        
        {/* ── TOP HEADER (Minimal) ── */}
        <header className="h-16 bg-fm-navy/90 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-black/50 border border-white/10"
              style={{ backgroundColor: playerClub.primaryColor, color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor }}
            >
              {playerClub.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-black text-white leading-tight tracking-wide truncate max-w-[150px]">{playerClub.name}</h4>
              <p className="text-[10px] text-fm-neonCyan font-bold uppercase tracking-widest">Season {activeSave.currentSeason} • Matchday {activeSave.currentMatchday}</p>
            </div>
          </div>
          
          <button
            onClick={handleExit}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-fm-slate hover:text-rose-500 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* ── DYNAMIC CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-24">
          <div className="w-full min-h-full flex flex-col p-4">
            {children}
          </div>
        </main>

        {/* ── BOTTOM NAVIGATION (App-Style) ── */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-fm-navyDark/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-evenly z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-safe">
          
          {/* Left Side Items */}
          {menuItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname === item.href ? 'text-fm-neonCyan' : 'text-fm-slate hover:text-white'}`}>
                <Icon className={`w-6 h-6 ${pathname === item.href ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}

          {/* ── CENTER FAB (Play / Advance) ── */}
          <div className="relative -top-6 flex flex-col items-center">
            <button
              onClick={handleAdvance}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 border-4 border-[#0f172a] ${!isMatchPlayed ? 'bg-fm-neonMagenta text-white shadow-fm-neonMagenta/50 animate-pulse' : 'bg-fm-neonCyan text-fm-navyDark shadow-fm-neonCyan/50'}`}
            >
              {!isMatchPlayed ? (
                <Play className="w-7 h-7 fill-current ml-1" />
              ) : (
                <ChevronRight className="w-8 h-8 stroke-[3]" />
              )}
            </button>
            <span className="text-[9px] font-black uppercase tracking-widest text-white mt-1 absolute -bottom-4">
              {!isMatchPlayed ? 'Play' : 'Advance'}
            </span>
          </div>

          {/* Right Side Items */}
          {menuItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname === item.href ? 'text-fm-neonCyan' : 'text-fm-slate hover:text-white'}`}>
                <div className="relative">
                  <Icon className={`w-6 h-6 ${pathname === item.href ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : ''}`} />
                  {item.name === "Inbox" && activeSave.inbox.filter((m: any) => !m.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0f172a]" />
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}

        </nav>
      </div>
    </div>
  );
}
