"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Trophy, Shield, Calendar, Mail, Flame, AlertCircle, Heart, Dumbbell,
  MessageSquare, User, Crosshair, TrendingUp, TrendingDown, Star, Activity, ArrowRight, Smartphone
} from "lucide-react";
import { LEAGUE_INFO, Club } from "../../../config/seededData";
import { InboxMessage } from "../../../db/storage";
import Link from "next/link";

export default function Dashboard() {
  const { activeSave, updateActiveSave } = useGame();
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const league = LEAGUE_INFO[playerClub.league];

  // Current fixture
  const currentFixture = activeSave.fixtures.find(
    f => f.matchday === activeSave.currentMatchday && 
    (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  );

  const opponentId = currentFixture 
    ? (currentFixture.homeClubId === playerClub.id ? currentFixture.awayClubId : currentFixture.homeClubId)
    : "";
  const opponentClub = activeSave.clubs.find(c => c.id === opponentId);

  // Standings position
  const standings = activeSave.standings[playerClub.league] || [];
  const playerPos = standings.findIndex(s => s.clubId === playerClub.id) + 1;
  const playerStanding = standings.find(s => s.clubId === playerClub.id);

  // Roster summaries
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id);
  const injuredPlayers = squad.filter(p => p.injuryStatus === "Injured");
  
  // Calculate average morale
  const avgMorale = squad.length > 0 ? squad.reduce((sum, p) => sum + p.morale, 0) / squad.length : 80;

  // Recent results
  const recentFixtures = activeSave.fixtures
    .filter(f => f.played && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id))
    .sort((a, b) => b.matchday - a.matchday)
    .slice(0, 5);

  // Derive unique stats
  const auraThresholds = [
    { threshold: 90, label: "Generational Genius", color: "text-purple-400" },
    { threshold: 75, label: "Respected Leader", color: "text-green-400" },
    { threshold: 50, label: "Under Pressure", color: "text-amber-400" },
    { threshold: 30, label: "Losing the Dressing Room", color: "text-orange-500" },
    { threshold: 0, label: "Absolute Fraud", color: "text-rose-500" },
  ];
  const aura = auraThresholds.find(a => activeSave.boardConfidence >= a.threshold) || auraThresholds[0];
  const mediaToxicity = Math.max(0, 100 - activeSave.boardConfidence + Math.floor(Math.random() * 20 - 10));

  // Derive Team Leaders
  const topScorer = [...squad].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...squad].sort((a, b) => b.assists - a.assists)[0];
  const highestOvr = [...squad].sort((a, b) => b.overall - a.overall)[0];
  const opponentDangerMan = activeSave.players.filter(p => p.clubId === opponentId).sort((a, b) => b.overall - a.overall)[0];

  // Procedural GafferGram Feed directly from activeSave
  const gafferFeed = activeSave.newsFeed || [];

  const handleMessageRead = (msgId: string) => {
    const updatedInbox = activeSave.inbox.map(m => {
      if (m.id === msgId) return { ...m, read: true };
      return m;
    });
    updateActiveSave({ ...activeSave, inbox: updatedInbox });
    setSelectedMessage(activeSave.inbox.find(m => m.id === msgId) || null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10">
      
      {/* 1. Manager Header (The Command Center Identity) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/60 pb-6 pt-2">
        <div className="flex items-center gap-5">
          {/* Avatar Area */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              {activeSave.manager.aiImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeSave.manager.aiImageUrl} alt="Manager" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 100 100" className="w-16 h-16 mt-2">
                  <path d="M20,90 Q50,70 80,90 Z" fill={activeSave.manager.avatar.shirtColor} />
                  <path d="M45,70 L55,70 L50,80 Z" fill={activeSave.manager.avatar.skinTone} />
                  <circle cx="50" cy="45" r="20" fill={activeSave.manager.avatar.skinTone} />
                  {activeSave.manager.avatar.hairStyle === "short" && (
                    <path d="M30,45 Q50,15 70,45 Q60,30 40,30 Z" fill={activeSave.manager.avatar.hairColor} />
                  )}
                  {activeSave.manager.avatar.hairStyle === "fade" && (
                    <path d="M32,40 Q50,20 68,40 Q65,25 35,25 Z" fill={activeSave.manager.avatar.hairColor} />
                  )}
                  {activeSave.manager.avatar.hairStyle === "long" && (
                    <path d="M30,50 Q40,15 50,15 Q60,15 70,50 L75,65 Q50,30 25,65 Z" fill={activeSave.manager.avatar.hairColor} />
                  )}
                  {activeSave.manager.avatar.hairStyle === "bald" && (
                    <path d="" fill={activeSave.manager.avatar.hairColor} />
                  )}
                </svg>
              )}
            </div>
            {/* Club Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg border-2 border-slate-900 bg-slate-800 shadow-xl flex items-center justify-center shrink-0">
              <img src={`/badges/${playerClub.id}.svg`} alt="" className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'; }} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeSave.manager.firstName} {activeSave.manager.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeSave.manager.reputationLabel}
              </span>
              <span className="text-xs font-medium text-slate-400 hidden sm:block">
                Manager of {playerClub.name}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Stats */}
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/60 shadow-inner">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transfer Budget</span>
            <span className="text-lg font-black text-emerald-400">£{(activeSave.transferBudget / 1000000).toFixed(1)}m</span>
          </div>
          <div className="flex flex-col bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/60 shadow-inner">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In-Game Date</span>
            <span className="text-lg font-black text-slate-200">Matchday {activeSave.currentMatchday}</span>
          </div>
        </div>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 auto-rows-[minmax(180px,_auto)]">
        
        {/* === COLUMN 1: TACTICAL & SOCIAL (Span 4) === */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* 2. Next Opponent Scouting Report (Bento Card) */}
          <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col relative h-full min-h-[280px]">
            {currentFixture && opponentClub ? (
              <>
                <div 
                  className="absolute top-0 inset-x-0 h-1"
                  style={{ backgroundColor: opponentClub.primaryColor }}
                />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                      Next Opponent
                    </div>
                    <span className="text-xs font-black bg-slate-800 px-2 py-1 rounded text-slate-300">
                      {currentFixture.homeClubId === playerClub.id ? "HOME" : "AWAY"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                    <img src={`/badges/${opponentClub.id}.svg`} alt="" className="w-14 h-14 object-contain drop-shadow-lg" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'; }} />
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black text-white">{opponentClub.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">{opponentClub.stadium}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Danger Man</span>
                      <span className="text-sm font-bold text-slate-200 truncate block">{opponentDangerMan?.name || "Unknown"}</span>
                      <span className="text-xs text-emerald-400 font-black mt-0.5 block">{opponentDangerMan?.overall || "?"} OVR</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Club Rating</span>
                      <span className="text-sm font-bold text-slate-200 block">{opponentClub.reputation}/100</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Formidable</span>
                    </div>
                  </div>
                </div>
                
                <Link href="/game/tactics" className="bg-slate-800/40 hover:bg-slate-800 border-t border-slate-800/60 p-3 text-center text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-2">
                  Prepare Tactics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-center">
                <Calendar className="w-8 h-8 mb-3 opacity-50" />
                <span className="text-sm font-bold">No Upcoming Fixtures</span>
              </div>
            )}
          </div>

          {/* 5. GafferGram Social Feed (Unique Narrative Bento) */}
          <div className="glass-card rounded-2xl border border-slate-800/60 flex flex-col overflow-hidden max-h-[350px]">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200">GafferGram Feed</h3>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Live</span>
              </div>
            </div>
            
            <div className="flex flex-col overflow-y-auto p-4 gap-4 scrollbar-hide flex-1">
              {gafferFeed.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">No news yet. Advance matchdays to generate news.</div>
              ) : (
                gafferFeed.slice(0, 50).map((article) => (
                  <div key={article.id} className="flex flex-col gap-1.5 border-b border-slate-800/40 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${article.type === 'transfer' ? 'bg-amber-500/20 text-amber-500' : article.type === 'drama' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          <User className="w-3 h-3 fill-current" />
                        </div>
                        <span className="text-xs font-bold text-slate-200">{article.author}</span>
                        <span className="text-[10px] text-slate-500">{article.handle}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">{article.date}</span>
                    </div>
                    <p className={`text-xs leading-relaxed pl-7.5 ${article.type === 'drama' ? 'text-rose-200' : article.type === 'transfer' ? 'text-amber-100 font-medium' : 'text-slate-300'}`}>
                      {article.content}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 pl-7.5 mt-1 font-medium">
                      <Heart className="w-3 h-3 text-rose-500/50" /> {article.likes.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* === COLUMN 2: OPERATIONS & DYNAMICS (Span 4) === */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* 8. Actionable Inbox (Shrunk Bento Card) */}
          <div className="glass-card rounded-2xl border border-slate-800/60 flex flex-col h-[350px]">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-slate-200">Inbox & Actions</h3>
              </div>
              {activeSave.inbox.filter(m => !m.read).length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeSave.inbox.filter(m => !m.read).length} New
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1">
              {activeSave.inbox.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">Inbox is empty.</div>
              ) : (
                activeSave.inbox.slice(0, 4).map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => handleMessageRead(msg.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition ${selectedMessage?.id === msg.id ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-900/30 border-transparent hover:bg-slate-800/50'} ${!msg.read ? 'border-l-2 border-l-sky-500' : ''}`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                      <span className={msg.type === 'board' ? 'text-amber-400' : msg.type === 'media' ? 'text-purple-400' : 'text-emerald-400'}>{msg.sender}</span>
                      <span className="text-slate-500">{msg.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 truncate text-[13px]">{msg.subject}</h4>
                  </button>
                ))
              )}
            </div>

            <Link href="/game/dashboard/inbox" className="bg-slate-800/40 hover:bg-slate-800 border-t border-slate-800/60 p-3 text-center text-xs font-bold text-slate-400 transition-colors">
              View Full Inbox
            </Link>
          </div>

          {/* 6. Squad Dynamics & Medical Center */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-3">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Squad Dynamics
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Squad Morale</span>
                  <span className="font-black text-emerald-400">{Math.round(avgMorale)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${avgMorale}%` }} />
                </div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div className={`p-2 rounded-lg ${injuredPlayers.length === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">Medical Center</span>
                    <span className="text-[10px] text-slate-500">{injuredPlayers.length === 0 ? "Fully Fit Squad" : `${injuredPlayers.length} Active Injuries`}</span>
                  </div>
                </div>
                {injuredPlayers.length > 0 && (
                  <span className="text-xs font-black text-rose-500">Critical</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === COLUMN 3: PERFORMANCE & VISION (Span 4) === */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* 3 & 4. Manager Aura & Club Vision Scorecard */}
          <div className="glass-card rounded-2xl border border-slate-800/60 flex flex-col overflow-hidden">
            {/* Top half: Aura */}
            <div className="p-5 border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Manager Aura
                </span>
                <span className={`text-lg font-black tracking-tight ${aura.color}`}>{aura.label}</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <span className={`text-sm font-black ${aura.color}`}>{Math.round(activeSave.boardConfidence)}</span>
              </div>
            </div>

            {/* Bottom half: Board Vision & Media Toxicity */}
            <div className="p-5 flex flex-col gap-4 bg-slate-900/30">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Board Expectation Grade</span>
                  <span className={`font-black text-lg ${activeSave.boardConfidence >= 80 ? 'text-emerald-400' : activeSave.boardConfidence >= 60 ? 'text-blue-400' : activeSave.boardConfidence >= 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                    {activeSave.boardConfidence >= 90 ? 'A+' : activeSave.boardConfidence >= 80 ? 'A' : activeSave.boardConfidence >= 70 ? 'B' : activeSave.boardConfidence >= 60 ? 'C' : activeSave.boardConfidence >= 40 ? 'D' : 'F'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed border-b border-slate-800/60 pb-3">
                  The board expects you to finish in the top half. Current trajectory is aligning with expectations. Keep results consistent.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Media Toxicity Index</span>
                  <span className={mediaToxicity > 70 ? 'text-rose-500' : 'text-slate-500'}>{mediaToxicity > 70 ? 'Hostile' : 'Calm'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${mediaToxicity > 70 ? 'bg-rose-500' : 'bg-slate-600'}`} style={{ width: `${mediaToxicity}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* League Standings (Condensed Bento) */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Standings
              </div>
              <Link href="/game/table" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">Full Table</Link>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {standings.slice(Math.max(0, playerPos - 3), Math.min(standings.length, playerPos + 2)).map((st, idx) => {
                const pos = standings.findIndex(s => s.clubId === st.clubId) + 1;
                const isPlayer = st.clubId === playerClub.id;
                return (
                  <div 
                    key={st.clubId}
                    className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl transition ${isPlayer ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold' : 'text-slate-400 bg-slate-900/40'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-4 text-right opacity-70">{pos}</span>
                      <span className="truncate max-w-[120px] text-slate-200">{st.clubName}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="w-6 text-right opacity-70">{st.played}p</span>
                      <span className="w-8 text-right font-black text-slate-100">{st.points}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. Team Leaders */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-3">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              Team Leaders
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Top Scorer</span>
                  <span className="text-xs font-bold text-slate-200">{topScorer?.name || "N/A"}</span>
                </div>
                <span className="text-sm font-black text-emerald-400">{topScorer?.goals || 0}</span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Top Assister</span>
                  <span className="text-xs font-bold text-slate-200">{topAssister?.name || "N/A"}</span>
                </div>
                <span className="text-sm font-black text-blue-400">{topAssister?.assists || 0}</span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Highest Rating</span>
                  <span className="text-xs font-bold text-slate-200">{highestOvr?.name || "N/A"}</span>
                </div>
                <span className="text-sm font-black text-yellow-400">{highestOvr?.overall || 0} OVR</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
