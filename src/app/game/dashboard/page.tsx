"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Trophy, Shield, Calendar, Mail, AlertCircle, Heart,
  Activity, ArrowRight, ChevronRight, Clock, Star
} from "lucide-react";
import { LEAGUE_INFO } from "../../../config/seededData";
import { InboxMessage } from "../../../db/storage";
import Link from "next/link";
import { CLUB_LOGOS } from "../../../config/clubLogos";

export default function Dashboard() {
  const { activeSave, updateActiveSave } = useGame();
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  
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
  let moraleText = "The squad is buzzing.";
  if (avgMorale < 75) {
    moraleColor = "text-[#f59e0b]";
    moraleText = "Mood is okay, but questionable.";
  }
  if (avgMorale < 50) {
    moraleColor = "text-rose-500";
    moraleText = "Dressing room is fractured.";
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
    <div className="relative flex-1 w-full flex flex-col gap-4 pb-4 min-h-full font-sans">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #22c55e 0, #22c55e 1px, transparent 0, transparent 50%)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        
        {/* Next Fixture Card (Hero) */}
        <div className="w-full rounded-3xl bg-[#0f1623] border border-[#1e2d40] overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#080c14] via-[#0f1623] to-[#0a1118]" />
          {currentFixture && opponentClub && (
            <div 
              className="absolute inset-y-0 right-0 w-[150%] opacity-20 mix-blend-screen transition-all duration-1000"
              style={{ background: `radial-gradient(circle at top right, ${opponentClub.primaryColor}, transparent 60%)` }}
            />
          )}

          <div className="relative p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#22c55e]">
              <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Next Match</span>
            </div>

            {currentFixture && opponentClub ? (
              <div className="flex items-center justify-between px-2">
                {/* Home Club */}
                <div className="flex flex-col items-center gap-3 w-[40%]">
                  <div className="w-16 h-16 bg-[#080c14] rounded-2xl flex items-center justify-center border border-white/10 shadow-xl p-3 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                    {CLUB_LOGOS[currentFixture.homeClubId] ? (
                      <img src={CLUB_LOGOS[currentFixture.homeClubId]} alt="" className="w-full h-full object-contain relative z-10 filter drop-shadow-md" />
                    ) : (
                      <span className="font-black text-2xl relative z-10">{currentFixture.homeClubId.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-black text-sm text-white text-center leading-tight truncate w-full px-2">
                    {currentFixture.homeClubId === playerClub.id ? (playerClub.shortName || playerClub.name) : (opponentClub.shortName || opponentClub.name)}
                  </span>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center w-[20%]">
                  <span className="text-2xl font-black text-slate-700 italic drop-shadow-sm">VS</span>
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const playerAvgOvr = activeSave.players.filter(p => p.clubId === playerClub.id).reduce((s, p, _, arr) => s + p.overall / arr.length, 0);
                      const oppAvgOvr = activeSave.players.filter(p => p.clubId === opponentClub.id).reduce((s, p, _, arr) => s + p.overall / arr.length, 0);
                      const diff = Math.min(5, Math.max(1, Math.round(((oppAvgOvr - playerAvgOvr) + 15) / 6) + 2));
                      return <Star key={i} className={`w-3 h-3 ${i < diff ? 'text-[#f59e0b] fill-current drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]' : 'text-slate-800'}`} />;
                    })}
                  </div>
                </div>

                {/* Away Club */}
                <div className="flex flex-col items-center gap-3 w-[40%]">
                  <div className="w-16 h-16 bg-[#080c14] rounded-2xl flex items-center justify-center border border-white/10 shadow-xl p-3 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                    {CLUB_LOGOS[currentFixture.awayClubId] ? (
                      <img src={CLUB_LOGOS[currentFixture.awayClubId]} alt="" className="w-full h-full object-contain relative z-10 filter drop-shadow-md" />
                    ) : (
                      <span className="font-black text-2xl relative z-10">{currentFixture.awayClubId.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-black text-sm text-white text-center leading-tight truncate w-full px-2">
                    {currentFixture.awayClubId === playerClub.id ? (playerClub.shortName || playerClub.name) : (opponentClub.shortName || opponentClub.name)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 font-bold">End of Season</div>
            )}
          </div>
        </div>

        {/* Web Push Banner (Mobile format) */}
        {typeof Notification !== "undefined" && Notification.permission === "default" && (
          <div className="rounded-2xl p-4 border border-blue-500/20 bg-blue-500/10 flex items-center justify-between gap-3 overflow-hidden relative shadow-lg">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-[30px] rounded-full" />
             <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 shadow-inner border border-blue-400/20">
                 <AlertCircle className="w-5 h-5 text-blue-400" />
               </div>
               <div className="flex flex-col">
                 <h4 className="text-sm font-black text-white">Enable Notifications</h4>
               </div>
             </div>
             <button 
               onClick={() => {
                 if (typeof Notification !== "undefined") {
                   Notification.requestPermission().then(permission => {
                     window.location.reload(); 
                     if (permission === "granted") {
                       new Notification("GafferIQ", { body: "Push notifications enabled!" });
                     }
                   });
                 }
               }} 
               className="bg-blue-600 active:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-transform active:scale-95 shadow-lg relative z-10"
             >
               Enable
             </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* League Position */}
          <Link href="/game/table" className="group rounded-3xl bg-slate-900/80 border border-white/5 p-4 flex flex-col gap-3 relative overflow-hidden transition-all active:scale-95 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-fm-neonCyan" /> Position
            </h3>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-4xl font-black text-white leading-none tracking-tighter">{playerPos}</span>
              <span className="text-xs font-bold text-slate-500 uppercase pb-1 tracking-widest">/ {standings.length}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-snug line-clamp-2">Pushing for the title</p>
          </Link>

          {/* Squad Morale */}
          <Link href="/game/squad" className="group rounded-3xl bg-slate-900/80 border border-white/5 p-4 flex flex-col gap-3 relative overflow-hidden transition-all active:scale-95 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Heart className={`w-3.5 h-3.5 ${moraleColor}`} /> Morale
            </h3>
            <div className="flex items-end gap-2 relative z-10">
              <span className={`text-4xl font-black leading-none tracking-tighter ${moraleColor}`}>{Math.round(avgMorale)}</span>
              <span className="text-xs font-bold text-slate-500 uppercase pb-1 tracking-widest">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-snug line-clamp-2">{moraleText}</p>
          </Link>

        </div>

        {/* Finances / Transfer Quick Widget */}
        <Link href="/game/transfers" className="rounded-3xl bg-emerald-900/20 border border-emerald-500/20 p-5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
           <div className="flex justify-between items-center z-10">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                Finances & Transfers
              </h3>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
           </div>
           <div className="flex items-baseline gap-2 z-10">
             <span className="text-2xl font-black text-white tracking-tighter">€{(activeSave.transferBudget / 1000000).toFixed(1)}M</span>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Budget</span>
           </div>
        </Link>

        {/* Recent Form */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/5 p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> Form Guide
          </h3>
          <div className="flex items-center justify-between w-full">
            {recentFixtures.length === 0 ? (
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest w-full text-center py-2">No matches played</span>
            ) : (
              recentFixtures.map((f, i) => {
                const res = getResult(f);
                const color = res === 'W' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : res === 'D' ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
                return (
                  <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${color}`}>
                    {res}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* News Feed / Inbox Widget */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/5 p-5 flex flex-col gap-4 shadow-xl">
           <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-fm-neonMagenta" /> Latest Inbox
            </h3>
            <Link href="/game/inbox" className="text-[10px] font-black text-fm-neonCyan uppercase tracking-widest">View All</Link>
           </div>
           
           <div className="flex flex-col gap-3">
              {activeSave.inbox.filter(m => !m.read).length === 0 && (
                 <div className="text-center py-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Inbox is empty</div>
              )}
              {activeSave.inbox.filter(m => !m.read).slice(0, 3).map((msg) => (
                <button 
                  key={msg.id} 
                  onClick={() => { setSelectedMessage(msg); handleMessageRead(msg.id); }}
                  className="flex gap-3 items-start bg-black/40 p-3 rounded-2xl border border-white/5 active:bg-white/5 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-fm-neonCyan mt-1.5 shrink-0 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-black">{msg.subject}</span>
                    <span className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{msg.content}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>

      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fm-neonMagenta/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-fm-neonMagenta" />
                </div>
                <h3 className="font-black text-white text-sm">Inbox Message</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h4 className="text-lg font-black text-white leading-tight">{selectedMessage.subject}</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
