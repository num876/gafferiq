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
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id && !p.isAcademy);
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
  const latestNewsList = gafferFeed.slice(0, 3);

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
                    {Array.from({ length: 5 }).map((_, i) => {
                      const playerAvgOvr = activeSave.players.filter(p => p.clubId === playerClub.id).reduce((s, p, _, arr) => s + p.overall / arr.length, 0);
                      const oppAvgOvr = activeSave.players.filter(p => p.clubId === opponentClub.id).reduce((s, p, _, arr) => s + p.overall / arr.length, 0);
                      const diff = Math.min(5, Math.max(1, Math.round(((oppAvgOvr - playerAvgOvr) + 15) / 6) + 2));
                      return <Star key={i} className={`w-4 h-4 ${i < diff ? 'text-[#f59e0b] fill-current' : 'text-slate-700'}`} />;
                    })}
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

        {/* Web Push Notification Banner */}
        {typeof Notification !== "undefined" && Notification.permission === "default" && (
          <div className="glass-card rounded-2xl p-4 border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-4 relative z-10">
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                 <AlertCircle className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                 <h4 className="text-sm font-black text-white">Enable Push Notifications</h4>
                 <p className="text-[10px] text-slate-400 mt-0.5">Get notified about idle income and offline simulation results.</p>
               </div>
             </div>
             <button 
               onClick={() => {
                 if (typeof Notification !== "undefined") {
                   Notification.requestPermission().then(permission => {
                     // Force re-render to hide banner
                     window.location.reload(); 
                     if (permission === "granted") {
                       new Notification("GafferIQ", { body: "Push notifications enabled! You will receive important game updates." });
                     }
                   });
                 }
               }} 
               className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition relative z-10 whitespace-nowrap"
             >
               Enable Now
             </button>
          </div>
        )}

        {/* Form Guide & League Position & Squad Morale Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Form Guide */}
          <div className="group rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden transition-all hover:border-sky-500/40">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Form Guide
            </h3>
            <div className="flex-1 flex items-center justify-center gap-3">
              {recentFixtures.length === 0 ? (
                <span className="text-slate-500 text-sm font-bold tracking-widest uppercase">No matches played</span>
              ) : (
                recentFixtures.map((f, i) => {
                  const res = getResult(f);
                  const color = res === 'W' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : res === 'D' ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                  return (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border ${color}`} title={f.homeScore !== null ? `${f.homeScore} - ${f.awayScore}` : ''}>
                      {res}
                    </div>
                  );
                })
              )}
            </div>
            {recentFixtures.length > 0 && recentFixtures[0].stats && (
              <div className="mt-2 text-center border-t border-white/5 pt-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Last Match Analysis</div>
                <div className="text-xs font-black text-white flex items-center justify-center gap-2">
                  <span>Score: {recentFixtures[0].homeScore}-{recentFixtures[0].awayScore}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-sky-400">xG: {recentFixtures[0].stats.xG?.home?.toFixed(2) || '0.00'} - {recentFixtures[0].stats.xG?.away?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Squad Morale */}
          <div className="group rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden transition-all hover:border-sky-500/40">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className={`w-4 h-4 ${moraleColor}`} /> Squad Morale
            </h3>
            <div className="flex-1 flex items-center gap-5 relative z-10">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_currentColor]" style={{ color: moraleColor }}>
                  <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * avgMorale) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-black ${moraleColor}`}>{Math.round(avgMorale)}</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-medium">
                {moraleText}
              </p>
            </div>
          </div>

          {/* League Position Widget */}
          <div className="group rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden transition-all hover:border-sky-500/40">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#f59e0b]" /> Standings
              </h3>
              <Link href="/game/table" className="text-[10px] text-sky-400 font-black uppercase tracking-widest hover:text-sky-300 transition">Full Table</Link>
            </div>
            <div className="flex flex-col gap-2 mt-2 relative z-10">
              {standings.slice(Math.max(0, playerPos - 3), Math.min(standings.length, playerPos + 2)).map((st) => {
                const pos = standings.findIndex(s => s.clubId === st.clubId) + 1;
                const isPlayer = st.clubId === playerClub.id;
                return (
                  <div key={st.clubId} className={`flex items-center justify-between text-[11px] py-2 px-3 rounded-lg transition-all ${isPlayer ? 'bg-sky-500/20 text-sky-400 font-black border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'text-slate-400 hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-5 text-right opacity-60 font-black">{pos}</span>
                      <span className="truncate w-24 font-bold">{st.clubName}</span>
                    </div>
                    <span className="font-black text-white">{st.points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

          {/* Finances */}
          <div className="group rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden transition-all hover:border-sky-500/40">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Finances
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-2 relative z-10">
              <div className="text-3xl font-black text-white tracking-tighter">€{(activeSave.bankBalance || 0).toLocaleString()}</div>
              <div className="text-sm font-semibold text-slate-400">Treasury</div>
              <div className="mt-2 text-xs text-slate-500">
                Wage Budget: €{(activeSave.wageBudget || 0).toLocaleString()}/w
              </div>
            </div>
          </div>


      </div>

      {/* =========================================
          RIGHT SIDEBAR (w-72)
          ========================================= */}
      <div className="w-full lg:w-72 flex flex-col gap-6 z-10 shrink-0">
        
        {/* Inbox Widget */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20 rounded-t-3xl relative z-10">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" /> Inbox
            </h3>
            {activeSave.inbox.filter(m => !m.read).length > 0 && (
              <span className="bg-sky-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                {activeSave.inbox.filter(m => !m.read).length} New
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2 relative z-10">
            {activeSave.inbox.slice(0, 3).map(msg => (
              <button
                key={msg.id}
                onClick={() => handleMessageRead(msg.id)}
                className={`w-full text-left p-4 rounded-2xl border text-xs flex flex-col gap-1.5 transition-all hover:scale-[1.02] ${!msg.read ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_4px_20px_rgba(56,189,248,0.1)]' : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'}`}
              >
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className={msg.type === 'board' ? 'text-amber-400' : msg.type === 'media' ? 'text-purple-400' : 'text-emerald-400'}>{msg.sender}</span>
                  <span className="text-slate-500 opacity-70">{msg.date}</span>
                </div>
                <h4 className="font-bold text-white truncate text-[13px]">{msg.subject}</h4>
              </button>
            ))}
          </div>
          <Link href="/game/inbox" className="p-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-sky-400 border-t border-white/5 bg-black/20 transition relative z-10 hover:bg-black/40">
            View All Messages
          </Link>
        </div>

        {/* Latest News */}
        {/* Latest News */}
        {latestNewsList.length > 0 && (
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden group max-h-80 overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3 mb-1 relative z-10 shrink-0">Latest News</h3>
            
            <div className="flex flex-col gap-4 relative z-10">
              {latestNewsList.map(news => (
                <div key={news.id} className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <h4 className="font-bold text-white text-sm leading-relaxed mb-2">{news.content}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">{news.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Fixture (Next Next) */}
        {nextNextFixture && (
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 mt-auto relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-amber-500 pl-3 relative z-10">On the Horizon</h3>
            <div className="flex items-center gap-4 relative z-10 bg-black/20 p-3 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#080c14] border border-white/10 flex items-center justify-center p-2 shadow-inner">
                {CLUB_LOGOS[nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId] ? (
                  <img src={CLUB_LOGOS[nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId]} alt="" className="w-full h-full object-contain filter drop-shadow-md" />
                ) : (
                  <span className="font-black text-sm text-slate-300">{(nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId).charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white truncate max-w-[140px]">
                  {nextNextFixture.homeClubId === playerClub.id ? nextNextFixture.awayClubId : nextNextFixture.homeClubId}
                </span>
                <span className="text-[10px] text-amber-400/80 flex items-center gap-1.5 font-bold uppercase tracking-wider mt-1">
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
