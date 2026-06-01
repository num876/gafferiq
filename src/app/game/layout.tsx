/* eslint-disable */
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useGame } from "../../context/GameContext";
import { 
  Trophy, LayoutDashboard, Users, Shield, Calendar, Table, 
  ArrowLeftRight, Search, TrendingUp, User, LogOut, ChevronRight, Play, Mail,
 Building, GraduationCap} from 'lucide-react';

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

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const currentFixture = activeSave.fixtures.find(
    f => f.matchday === activeSave.currentMatchday && 
    (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  );

  const isMatchPlayed = currentFixture ? currentFixture.played : true;

  const menuItems = [
    { name: "Dashboard", href: "/game/dashboard", icon: LayoutDashboard },
    { name: "Inbox", href: "/game/inbox", icon: Mail },
    { name: "Squad", href: "/game/squad", icon: Users },
    { name: "Tactics", href: "/game/tactics", icon: Shield },
    { name: "Fixtures", href: "/game/fixtures", icon: Calendar },
    { name: "League Table", href: "/game/table", icon: Table },
    { name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },
    { name: "Scouting", href: "/game/scouting", icon: Search },
    { name: "Board & Finances", href: "/game/board", icon: Building },
    { name: "Training", href: "/game/training", icon: TrendingUp },
    { name: "Manager Profile", href: "/game/profile", icon: User },
  ];

  const handleAdvance = () => {
    if (!isMatchPlayed) {
      router.push("/game/match");
    } else {
      advanceToNextMatchday();
    }
  };

  const handleExit = () => {
    exitToMainMenu();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col justify-between shrink-0 hidden md:flex shadow-2xl z-20 relative">
        <div className="flex flex-col gap-6 p-6">
          {/* Logo / Club Branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow border border-white/10"
              style={{ 
                backgroundColor: playerClub.primaryColor,
                color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor 
              }}
            >
              {playerClub.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate">{playerClub.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{activeSave.manager.firstName} {activeSave.manager.lastName}</p>
            </div>
          </div>

          {/* Manager XP Bar */}
          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-[#22c55e]">Reputation {activeSave.manager.reputation}</span>
              <span className="text-slate-500">Lvl {Math.floor(activeSave.manager.reputation / 20) + 1}</span>
            </div>
            <div className="w-full h-1.5 bg-[#1e2d40] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                style={{ width: `${(activeSave.manager.reputation % 20) * 5}%` }} 
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 text-xs font-bold transition-all duration-300 ${isActive ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]' : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Exit Button */}
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950/50 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-slate-400 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit to Main Menu
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Game Status Bar */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/60 px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
          {/* Left details */}
          <div className="flex items-center gap-6 text-xs text-slate-400">
            {/* Mobile Nav Trigger */}
            <div className="md:hidden flex items-center gap-2">
              <span className="font-bold text-white uppercase text-sm">Gaffer<span className="text-green-500">IQ</span></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 font-bold text-slate-300">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">S{activeSave.currentSeason}</span>
              <span>Matchday {activeSave.currentMatchday}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-500">•</span>
              <span>Budget:</span>
              <span className="font-bold text-green-400">€{(activeSave.transferBudget / 1000000).toFixed(1)}M</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-500">•</span>
              <span>Wage Limit:</span>
              <span className="font-bold text-slate-300">€{(activeSave.wageBudget / 1000).toFixed(0)}k/wk</span>
            </div>
          </div>

          {/* Right Action: Advance Matchday */}
          <div className="flex items-center gap-3">
            {/* Small Manager thumbnail */}
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center overflow-hidden">
              {activeSave.manager.aiImageUrl ? (
                <img src={activeSave.manager.aiImageUrl} alt="Manager" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 100 100" className="w-7 h-7 mt-1.5">
                  <path d="M20,90 Q50,70 80,90 Z" fill={activeSave.manager.avatar.shirtColor} />
                  <circle cx="50" cy="50" r="22" fill={activeSave.manager.avatar.skinTone} />
                  <path d="M30,45 Q50,30 70,45" fill={activeSave.manager.avatar.hairColor} strokeWidth="1.5" />
                  <circle cx="44" cy="48" r="2" fill="#1e293b" />
                  <circle cx="56" cy="48" r="2" fill="#1e293b" />
                </svg>
              )}
            </div>

            {/* Advance Button */}
            <button
              onClick={handleAdvance}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95 ${!isMatchPlayed ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/10'}`}
            >
              {!isMatchPlayed ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Matchday {activeSave.currentMatchday}
                </>
              ) : (
                <>
                  Advance Matchday
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic page contents */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0f172a]">
          {/* Mobile navigation links shortcut */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-800 text-[10px] font-bold text-slate-400">
            {menuItems.map(item => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`px-3 py-1.5 rounded-full whitespace-nowrap ${pathname === item.href ? 'bg-green-600 text-white' : 'bg-slate-900 border border-slate-800'}`}
              >
                {item.name}
              </Link>
            ))}
            <button 
              onClick={handleExit} 
              className="px-3 py-1.5 rounded-full whitespace-nowrap bg-slate-900 border border-slate-800 text-rose-500"
            >
              Exit
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
