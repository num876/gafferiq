"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Trophy, Shield, Calendar, Mail, AlertCircle, Heart,
  TrendingUp, TrendingDown, Activity, ArrowRight, ChevronRight, CheckCircle, Clock, Star
} from "lucide-react";
import { LEAGUE_INFO, Club } from "../../../config/seededData";
import { InboxMessage } from "../../../db/storage";
import Link from "next/link";
import { CLUB_LOGOS } from "../../../config/clubLogos";

export default function Dashboard() {
  const { activeSave, updateActiveSave } = useGame();
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const league = LEAGUE_INFO[playerClub.league];

  // Current fixture
  const upcomingFixtures = activeSave.fixtures.filter(
    f => !f.played && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  ).sort((a, b) => a.matchday - b.matchday);

  const currentFixture = upcomingFixtures[0];
  const nextNextFixture = upcomingFixtures[1];

  const opponentId = currentFixture 
    ? (currentFixture.homeClubId === playerClub.id ? currentFixture.awayClubId : currentFixture.homeClubId)
    : "";
  const opponentClub = activeSave.clubs.find(c => c.id === opponentId);

  // Standings position
  const standings = activeSave.standings[playerClub.league] || [];
  const playerPos = standings.findIndex(s => s.clubId === playerClub.id) + 1;

  // Roster summaries
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id);
  const avgMorale = squad.length > 0 ? squad.reduce((sum, p) => sum + p.morale, 0) / squad.length : 80;

  let moraleColor = "text-[#22c55e]";
  let moraleBg = "bg-[#22c55e]";
  let moraleText = "The squad is buzzing. High confidence and excellent dressing room atmosphere.";
  if (avgMorale < 75) {
    moraleColor = "text-[#f59e0b]";
    moraleBg = "bg-[#f59e0b]";
    moraleText = "Mood is okay, but some players are starting to question recent decisions.";
  }
  if (avgMorale < 50) {
    moraleColor = "text-rose-500";
    moraleBg = "bg-rose-500";
    moraleText = "Dressing room is fractured. You need results quickly to win them back.";
  }

  // Recent results Form Guide
  const recentFixtures = activeSave.fixtures
    .filter(f => f.played && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id))
    .sort((a, b) => b.matchday - a.matchday)
    .slice(0, 5)
    .reverse();

  const getResult = (f: any) => {
    const isHome = f.homeClubId === playerClub.id;
    const homeScore = f.homeScore || 0;
    const awayScore = f.awayScore || 0;
    if (homeScore === awayScore) return 'D';
    if (isHome && homeScore > awayScore) return 'W';
    if (!isHome && awayScore > homeScore) return 'W';
    return 'L';
  };

  const gafferFeed = activeSave.newsFeed || [];
  const latestNews = gafferFeed[0];

  const handleMessageRead = (msgId: string) => {
    const updatedInbox = activeSave.inbox.map(m => {
      if (m.id === msgId) return { ...m, read: true };
      return m;
    });
    updateActiveSave({ ...activeSave, inbox: updatedInbox });
  };

  return (
    <div className="relative flex-1 w-full flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto pb-10 min-h-full">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #22c55e 0, #22c55e 1px, transparent 0, transparent 50%)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* =========================================
          CENTRE PANEL (flex-1)
          ========================================= */}
      <div className="flex-1 flex flex-col gap-6 z-10">
        
        {/* Next Fixture Atmospheric Card */}
        <div className="w-full rounded-2xl bg-[#0f1623] border border-[#1e2d40] overflow-hidden relative shadow-2xl">
          {/* Background Gradient & Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#080c14] via-[#0f1623] to-[#0a1118]" />
          {currentFixture && opponentClub && (
            <div 
              className="absolute inset-y-0 right-0 w-1/2 opacity-10 mix-blend-screen"
              style={{ background: `radial-gradient(circle at right, ${opponentClub.primaryColor}, transparent 70%)` }}
            />
          )}

          <div className="relative p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#22c55e]">
              <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Next Fixture</span>
              <span className="text-slate-400">Matchday {activeSave.currentMatchday}</span>
            </div>

            {currentFixture && opponentClub ? (
              <div className="flex items-center justify-between px-4 sm:px-12">
                {/* Home Club */}
                <div className="flex flex-col items-center gap-4 w-1/3">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#080c14] rounded-2xl flex items-center justify-center border border-white/5 shadow-xl p-4">
                    {CLUB_LOGOS[currentFixture.homeClubId] ? (
                      <img src={CLUB_LOGOS[currentFixture.homeClubId]} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-4xl">{currentFixture.homeClubId.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-black text-lg text-white text-center">{currentFixture.homeClubId === playerClub.id ? playerClub.name : opponentClub.name}</span>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center w-1/3">
                  <span className="text-3xl font-black text-slate-700 italic">VS</span>
                  <div className="mt-4 flex gap-1">
                    {/* Predicted Difficulty Stars */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.ceil(opponentClub.reputation / 20) ? 'text-[#f59e0b] fill-current' : 'text-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Est. Difficulty</span>
                </div>

                {/* Away Club */}
                <div className="flex flex-col items-center gap-4 w-1/3">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#080c14] rounded-2xl flex items-center justify-center border border-white/5 shadow-xl p-4">
                    {CLUB_LOGOS[currentFixture.awayClubId] ? (
                      <img src={CLUB_LOGOS[currentFixture.awayClubId]} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-4xl">{currentFixture.awayClubId.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-black text-lg text-white text-center">{currentFixture.awayClubId === playerClub.id ? playerClub.name : opponentClub.name}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-bold">End of Season</div>
            )}

            <div className="flex justify-center mt-4">
              <Link href="/game/tactics" className="px-8 py-3 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform active:scale-95">
                Prepare Tactics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Form Guide & League Position & Squad Morale Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form Guide */}
          <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] p-6 shadow-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#22c55e]" /> Form Guide
            </h3>
            <div className="flex-1 flex items-center justify-center gap-3">
              {recentFixtures.length === 0 ? (
                <span className="text-slate-500 text-sm">No matches played</span>
              ) : (
                recentFixtures.map((f, i) => {
                  const res = getResult(f);
                  const color = res === 'W' ? 'bg-[#22c55e]' : res === 'D' ? 'bg-slate-500' : 'bg-rose-500';
                  return (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs shadow-md ${color}`}>
                      {res}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Squad Morale */}
          <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] p-6 shadow-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className={`w-4 h-4 ${moraleColor}`} /> Squad Morale
            </h3>
            <div className="flex-1 flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#1e2d40]" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * avgMorale) / 100} className={`${moraleColor} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-black ${moraleColor}`}>{Math.round(avgMorale)}</span>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                {moraleText}
              </p>
            </div>
          </div>

          {/* League Position Widget */}
          <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] p-6 shadow-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#f59e0b]" /> Standings
              </h3>
              <Link href="/game/table" className="text-[10px] text-blue-400 font-bold uppercase hover:underline">Full Table</Link>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {standings.slice(Math.max(0, playerPos - 3), Math.min(standings.length, playerPos + 2)).map((st) => {
                const pos = standings.findIndex(s => s.clubId === st.clubId) + 1;
                const isPlayer = st.clubId === playerClub.id;
                return (
                  <div key={st.clubId} className={`flex items-center justify-between text-[11px] py-1.5 px-2 rounded ${isPlayer ? 'bg-[#22c55e]/10 text-[#22c55e] font-bold border border-[#22c55e]/20' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 text-right opacity-50">{pos}</span>
                      <span className="truncate w-24">{st.clubName}</span>
                    </div>
                    <span className="font-black text-white">{st.points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================
          RIGHT SIDEBAR (w-72)
          ========================================= */}
      <div className="w-full lg:w-72 flex flex-col gap-6 z-10 shrink-0">
        
        {/* Inbox Widget */}
        <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] shadow-lg flex flex-col h-72">
          <div className="p-4 border-b border-[#1e2d40] flex items-center justify-between bg-[#080c14]/50 rounded-t-2xl">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" /> Inbox
            </h3>
            {activeSave.inbox.filter(m => !m.read).length > 0 && (
              <span className="bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {activeSave.inbox.filter(m => !m.read).length} New
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1">
            {activeSave.inbox.slice(0, 3).map(msg => (
              <button
                key={msg.id}
                onClick={() => handleMessageRead(msg.id)}
                className={`w-full text-left p-3 rounded-xl border text-[11px] flex flex-col gap-1 transition ${!msg.read ? 'bg-sky-500/10 border-sky-500/50' : 'bg-transparent border-transparent hover:bg-[#1e2d40]/50 text-slate-400'}`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className={msg.type === 'board' ? 'text-amber-400' : msg.type === 'media' ? 'text-purple-400' : 'text-emerald-400'}>{msg.sender}</span>
                  <span className="text-slate-500 opacity-70">{msg.date}</span>
                </div>
                <h4 className="font-bold text-white truncate text-[12px]">{msg.subject}</h4>
              </button>
            ))}
          </div>
          <Link href="/game/dashboard/inbox" className="p-3 text-center text-[10px] font-bold text-slate-400 hover:text-white border-t border-[#1e2d40] transition">
            View All Messages
          </Link>
        </div>

        {/* Latest News */}
        {latestNews && (
          <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2 mb-1">Latest News</h3>
            <h4 className="font-bold text-white text-sm leading-snug">{latestNews.content}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400 bg-[#080c14] px-2 py-1 rounded border border-[#1e2d40]">{latestNews.author}</span>
            </div>
          </div>
        )}

        {/* Upcoming Fixture (Next Next) */}
        {nextNextFixture && (
          <div className="rounded-2xl bg-[#0f1623] border border-[#1e2d40] p-5 shadow-lg flex flex-col gap-3 mt-auto">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-[#f59e0b] pl-2 mb-1">On the Horizon</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#080c14] border border-white/5 flex items-center justify-center p-2">
                {CLUB_LOGOS[nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId] ? (
                  <img src={CLUB_LOGOS[nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId]} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-xs">{(nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId).charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white truncate max-w-[150px]">
                  {nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                  <Clock className="w-3 h-3" /> Matchday {nextNextFixture.matchday}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
