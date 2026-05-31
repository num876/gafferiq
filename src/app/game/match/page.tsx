"use client";

import React, { useState, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { MatchEvent, MatchStats } from "../../../db/storage";
import { Player, Club } from "../../../config/seededData";
import { autoSelectLineup } from "../../../engine/simulator";
import { 
  Play, Check, MessageSquare, Clock, ShieldAlert, Award, 
  Activity, RefreshCw, Volume2, TrendingUp, Megaphone, Flag,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MATCH STATE REDUCER ---
type Zone = "home-third" | "midfield" | "away-third";
type MatchStatus = "pre-match" | "first-half" | "half-time" | "second-half" | "post-match";

interface MatchState {
  status: MatchStatus;
  clock: number;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  stats: MatchStats;
  currentZone: Zone;
  commentaryTicker: string[];
  homeTacticsModifier: number; // Affects goal probabilities
  report: string;
}

type Action = 
  | { type: "TICK"; payload: { isHome: boolean, homeStrength: number, awayStrength: number, homeStarters: Player[], awayStarters: Player[] } }
  | { type: "SET_STATUS"; payload: MatchStatus }
  | { type: "ADD_COMMENTARY"; payload: string }
  | { type: "TACTICAL_SHOUT"; payload: number }
  | { type: "SET_REPORT"; payload: string };

const initialStats: MatchStats = {
  possession: { home: 50, away: 50 },
  shots: { home: 0, away: 0 },
  shotsOnTarget: { home: 0, away: 0 },
  corners: { home: 0, away: 0 },
  fouls: { home: 0, away: 0 },
  offsides: { home: 0, away: 0 }
};

const initialState: MatchState = {
  status: "pre-match",
  clock: 0,
  homeScore: 0,
  awayScore: 0,
  events: [],
  stats: JSON.parse(JSON.stringify(initialStats)),
  currentZone: "midfield",
  commentaryTicker: ["Welcome to the match! Kickoff is imminent."],
  homeTacticsModifier: 0,
  report: ""
};

// Procedural Event Generators for the Tick Engine
const pickAttacker = (starters: Player[]) => {
  const atts = starters.filter(p => p.position === "ATT");
  return atts.length > 0 ? atts[Math.floor(Math.random() * atts.length)] : starters[0];
};

const pickDefender = (starters: Player[]) => {
  const defs = starters.filter(p => p.position === "DEF");
  return defs.length > 0 ? defs[Math.floor(Math.random() * defs.length)] : starters[0];
};

function matchReducer(state: MatchState, action: Action): MatchState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "ADD_COMMENTARY":
      return { 
        ...state, 
        commentaryTicker: [action.payload, ...state.commentaryTicker].slice(0, 3) 
      };
    case "TACTICAL_SHOUT":
      return { ...state, homeTacticsModifier: action.payload };
    case "SET_REPORT":
      return { ...state, report: action.payload };
    case "TICK":
      if (state.status !== "first-half" && state.status !== "second-half") return state;
      if (state.clock >= 45 && state.status === "first-half") return state; // handled outside
      if (state.clock >= 90 && state.status === "second-half") return state; // handled outside

      const nextClock = state.clock + 1;
      const { isHome, homeStrength, awayStrength, homeStarters, awayStarters } = action.payload;

      const newState = { ...state, clock: nextClock };
      
      // Update possession slightly
      const possShift = (Math.random() * 4 - 2) + (state.homeTacticsModifier * 1.5);
      newState.stats.possession.home = Math.max(30, Math.min(70, state.stats.possession.home + possShift));
      newState.stats.possession.away = 100 - newState.stats.possession.home;

      // Determine who has the ball
      const homeHasBall = Math.random() * 100 < newState.stats.possession.home;
      newState.currentZone = homeHasBall 
        ? (Math.random() > 0.4 ? "away-third" : "midfield") 
        : (Math.random() > 0.4 ? "home-third" : "midfield");

      // Attempt Attack (approx 20% chance of an "incident" per minute)
      if (Math.random() < 0.20) {
        const attackRep = homeHasBall ? homeStrength + state.homeTacticsModifier : awayStrength;
        const defenseRep = homeHasBall ? awayStrength : homeStrength + state.homeTacticsModifier;
        
        // Base goal probability: ~10% of attacks
        const ratio = attackRep / (attackRep + defenseRep);
        const goalProb = ratio * 0.15; 
        
        const roll = Math.random();
        const attackingClubId = homeHasBall ? (isHome ? "HOME" : "AWAY") : (isHome ? "AWAY" : "HOME"); // We map this later
        const attStarters = homeHasBall ? homeStarters : awayStarters;
        const defStarters = homeHasBall ? awayStarters : homeStarters;

        if (roll < goalProb) {
          // GOAL
          const scorer = pickAttacker(attStarters);
          if (homeHasBall) {
            newState.homeScore++;
            newState.stats.shots.home++;
            newState.stats.shotsOnTarget.home++;
          } else {
            newState.awayScore++;
            newState.stats.shots.away++;
            newState.stats.shotsOnTarget.away++;
          }
          newState.events = [{
            minute: nextClock, type: "Goal", clubId: homeHasBall ? "HOME" : "AWAY", 
            playerName: scorer.name, details: `${scorer.name} fires a sensational strike into the back of the net!`
          }, ...newState.events];
          newState.currentZone = "midfield"; // reset after goal

        } else if (roll < goalProb + 0.25) {
          // SHOT SAVED
          const shooter = pickAttacker(attStarters);
          if (homeHasBall) {
            newState.stats.shots.home++;
            newState.stats.shotsOnTarget.home++;
            newState.stats.corners.home += Math.random() > 0.5 ? 1 : 0;
          } else {
            newState.stats.shots.away++;
            newState.stats.shotsOnTarget.away++;
            newState.stats.corners.away += Math.random() > 0.5 ? 1 : 0;
          }
          newState.events = [{
            minute: nextClock, type: "Shot Saved", clubId: homeHasBall ? "HOME" : "AWAY", 
            playerName: shooter.name, details: `Brilliant save to deny ${shooter.name}'s powerful effort.`
          }, ...newState.events];

        } else if (roll < goalProb + 0.50) {
          // MISS
          if (homeHasBall) newState.stats.shots.home++;
          else newState.stats.shots.away++;
        }
      }

      // Random cards
      if (Math.random() < 0.02) {
        const isFoulByHome = !homeHasBall;
        const foulStarters = isFoulByHome ? homeStarters : awayStarters;
        const fouler = pickDefender(foulStarters);
        if (isFoulByHome) newState.stats.fouls.home++;
        else newState.stats.fouls.away++;

        if (Math.random() < 0.2) { // 20% of fouls are yellow
          newState.events = [{
            minute: nextClock, type: "Yellow Card", clubId: isFoulByHome ? "HOME" : "AWAY", 
            playerName: fouler.name, details: `Yellow card for ${fouler.name} after a cynical challenge.`
          }, ...newState.events];
        }
      }

      return newState;
    default:
      return state;
  }
}

// Helper to calculate raw team strength
const getStrength = (starters: Player[]) => starters.reduce((s, p) => s + p.overall, 0) / starters.length;

// --- COMPONENT ---
export default function MatchViewer() {
  const router = useRouter();
  const { activeSave, updateActiveSave, advanceToNextMatchday } = useGame();
  
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal States
  const [teamTalkModal, setTeamTalkModal] = useState(false);
  const [teamTalkMsg, setTeamTalkMsg] = useState("");
  const [subModal, setSubModal] = useState(false);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const fixture = activeSave.fixtures.find(
    f => f.matchday === activeSave.currentMatchday && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  );

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No Match Scheduled</h2>
        <button onClick={() => advanceToNextMatchday()} className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold">Advance Matchday</button>
      </div>
    );
  }

  const isHome = fixture.homeClubId === playerClub.id;
  const opponentClub = activeSave.clubs.find(c => c.id === (isHome ? fixture.awayClubId : fixture.homeClubId))!;
  
  const homeClub = isHome ? playerClub : opponentClub;
  const awayClub = isHome ? opponentClub : playerClub;

  const homeSquad = activeSave.players.filter(p => p.clubId === homeClub.id);
  const awaySquad = activeSave.players.filter(p => p.clubId === awayClub.id);

  // We memoize starters so they don't regenerate every render
  const homeLineups = useRef(autoSelectLineup(homeSquad, "4-3-3"));
  const awayLineups = useRef(autoSelectLineup(awaySquad, "4-3-3"));

  const homeStrength = getStrength(homeLineups.current.starters) + 2.5; // Home adv
  const awayStrength = getStrength(awayLineups.current.starters);

  // Setup the ticker
  useEffect(() => {
    if (state.status === "first-half" || state.status === "second-half") {
      timerRef.current = setInterval(() => {
        
        // Stop conditions
        if (state.clock === 45 && state.status === "first-half") {
          dispatch({ type: "SET_STATUS", payload: "half-time" });
          clearInterval(timerRef.current!);
          return;
        }
        if (state.clock >= 90 && state.status === "second-half") {
          dispatch({ type: "SET_STATUS", payload: "post-match" });
          clearInterval(timerRef.current!);
          generatePostMatchReport();
          return;
        }

        // Fetch commentary every 5 mins
        if (state.clock > 0 && state.clock % 5 === 0) {
          fetchCommentary(state.clock);
        }

        // Tick
        dispatch({ 
          type: "TICK", 
          payload: { 
            isHome, 
            homeStrength, 
            awayStrength, 
            homeStarters: homeLineups.current.starters, 
            awayStarters: awayLineups.current.starters 
          } 
        });

      }, 1000); // 1 real sec = 1 game min
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.clock]);

  const startMatch = () => {
    dispatch({ type: "SET_STATUS", payload: "first-half" });
  };

  // APIs
  const fetchCommentary = async (minute: number) => {
    try {
      const res = await fetch("/api/claude/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchState: state,
          homeClubName: homeClub.shortName,
          awayClubName: awayClub.shortName
        })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "ADD_COMMENTARY", payload: `${minute}' - ${data.commentary}` });
      }
    } catch (e) {}
  };

  const handleTeamTalk = async (intent: string) => {
    setTeamTalkModal(true);
    try {
      const res = await fetch("/api/claude/team-talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          homeClubName: homeClub.name,
          awayClubName: awayClub.name,
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          isHome
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTeamTalkMsg(`"${data.message}"`);
        // Resume play after 3 seconds
        setTimeout(() => {
          setTeamTalkModal(false);
          setTeamTalkMsg("");
          if (state.status === "half-time") dispatch({ type: "SET_STATUS", payload: "second-half" });
        }, 3500);
      }
    } catch (e) {
      setTeamTalkModal(false);
      if (state.status === "half-time") dispatch({ type: "SET_STATUS", payload: "second-half" });
    }
  };

  const generatePostMatchReport = async () => {
    // Map events real IDs
    const mappedEvents = state.events.map(e => ({
      ...e,
      clubId: e.clubId === "HOME" ? homeClub.id : awayClub.id
    }));

    try {
      const res = await fetch("/api/claude/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchState: { ...state, events: mappedEvents },
          homeClub,
          awayClub,
          motmName: homeLineups.current.starters[Math.floor(Math.random()*3)].name // Pseudo MOTM
        })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_REPORT", payload: data.report });
      }
    } catch (e) {}

    // Save result to context
    const newState = { ...activeSave };
    const stateFixture = newState.fixtures.find(f => f.id === fixture.id)!;
    stateFixture.played = true;
    stateFixture.homeScore = state.homeScore;
    stateFixture.awayScore = state.awayScore;
    updateActiveSave(newState);
  };

  const applyShout = (intent: string, modifier: number) => {
    dispatch({ type: "TACTICAL_SHOUT", payload: modifier });
    dispatch({ type: "ADD_COMMENTARY", payload: `MANAGER SHOUT: "${intent}"` });
  };

  // --- RENDER HELPERS ---
  const getEventIcon = (type: string) => {
    switch(type) {
      case "Goal": return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)]"><Check className="w-3 h-3 text-white" /></div>;
      case "Yellow Card": return <div className="w-3.5 h-5 rounded bg-yellow-400 mx-0.5 shadow-sm" />;
      case "Red Card": return <div className="w-3.5 h-5 rounded bg-red-500 mx-0.5 shadow-sm" />;
      case "Shot Saved": return <Activity className="w-5 h-5 text-blue-400" />;
      default: return <MessageSquare className="w-5 h-5 text-slate-400" />;
    }
  };

  const isLive = state.status === "first-half" || state.status === "second-half";
  const displayClock = state.status === "pre-match" ? "00:00" : state.status === "post-match" ? "FT" : state.status === "half-time" ? "HT" : `${state.clock.toString().padStart(2, '0')}:00`;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] font-sans overflow-hidden bg-[#05080f]">
      
      {/* 
        ========================================================
        TOP BAR: SCORE & CLOCK
        ======================================================== 
      */}
      <div className="h-24 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-[#1e2d40] flex items-center justify-center px-8 relative shrink-0 shadow-2xl z-20">
        
        {/* Home */}
        <div className="flex items-center gap-4 absolute left-8">
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-white uppercase tracking-tighter">{homeClub.shortName}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{homeClub.league}</span>
          </div>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg text-2xl font-black border border-white/10" style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}>
            {homeClub.name.charAt(0)}
          </div>
        </div>

        {/* Center Score */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-[#0f1623] border border-[#1e2d40] px-8 py-2 rounded-2xl flex items-center gap-6 shadow-inner">
            <span className="text-4xl font-black text-white">{state.homeScore}</span>
            <div className="w-px h-8 bg-[#1e2d40]"></div>
            <span className="text-4xl font-black text-white">{state.awayScore}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1e2d40] px-4 py-1 rounded-full text-xs font-black text-white tracking-widest">
            <Clock className={`w-3.5 h-3.5 ${isLive ? 'text-green-400 animate-pulse' : 'text-slate-400'}`} />
            {displayClock}
          </div>
        </div>

        {/* Away */}
        <div className="flex items-center gap-4 absolute right-8">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg text-2xl font-black border border-white/10" style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}>
            {awayClub.name.charAt(0)}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-black text-white uppercase tracking-tighter">{awayClub.shortName}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Away</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================
        MAIN 3-COLUMN BROADCAST LAYOUT
        ======================================================== 
      */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: STATS PANEL */}
        <div className="w-80 bg-[#0a0f1e] border-r border-[#1e2d40] p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#1e2d40] pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" /> Match Stats
          </h3>

          <div className="flex flex-col gap-5">
            {/* Possession */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-black text-white">
                <span>{Math.round(state.stats.possession.home)}%</span>
                <span className="text-slate-500 uppercase tracking-widest">Possession</span>
                <span>{Math.round(state.stats.possession.away)}%</span>
              </div>
              <div className="flex h-2 bg-[#080c14] rounded-full overflow-hidden border border-[#1e2d40]">
                <div className="h-full bg-sky-500 transition-all duration-1000 ease-linear" style={{ width: `${state.stats.possession.home}%` }} />
                <div className="h-full bg-rose-500 transition-all duration-1000 ease-linear" style={{ width: `${state.stats.possession.away}%` }} />
              </div>
            </div>

            {/* Shots */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-black text-white">
                <span>{state.stats.shots.home}</span>
                <span className="text-slate-500 uppercase tracking-widest">Shots</span>
                <span>{state.stats.shots.away}</span>
              </div>
              <div className="flex h-2 bg-[#080c14] rounded-full overflow-hidden border border-[#1e2d40]">
                <div className="h-full bg-sky-500 transition-all duration-1000 ease-linear" style={{ width: `${(state.stats.shots.home / Math.max(1, state.stats.shots.home + state.stats.shots.away)) * 100}%` }} />
                <div className="h-full bg-rose-500 transition-all duration-1000 ease-linear" style={{ width: `${(state.stats.shots.away / Math.max(1, state.stats.shots.home + state.stats.shots.away)) * 100}%` }} />
              </div>
            </div>

            {/* Shots On Target */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-black text-white">
                <span>{state.stats.shotsOnTarget.home}</span>
                <span className="text-slate-500 uppercase tracking-widest">On Target</span>
                <span>{state.stats.shotsOnTarget.away}</span>
              </div>
              <div className="flex h-2 bg-[#080c14] rounded-full overflow-hidden border border-[#1e2d40]">
                <div className="h-full bg-sky-500 transition-all duration-1000 ease-linear" style={{ width: `${(state.stats.shotsOnTarget.home / Math.max(1, state.stats.shotsOnTarget.home + state.stats.shotsOnTarget.away)) * 100}%` }} />
                <div className="h-full bg-rose-500 transition-all duration-1000 ease-linear" style={{ width: `${(state.stats.shotsOnTarget.away / Math.max(1, state.stats.shotsOnTarget.home + state.stats.shotsOnTarget.away)) * 100}%` }} />
              </div>
            </div>

            {/* Corners & Fouls */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-[#0f1623] border border-[#1e2d40] rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Corners</span>
                <div className="flex gap-3 items-center mt-1">
                  <span className="text-sm font-black text-sky-400">{state.stats.corners.home}</span>
                  <span className="text-slate-700">-</span>
                  <span className="text-sm font-black text-rose-400">{state.stats.corners.away}</span>
                </div>
              </div>
              <div className="bg-[#0f1623] border border-[#1e2d40] rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Fouls</span>
                <div className="flex gap-3 items-center mt-1">
                  <span className="text-sm font-black text-sky-400">{state.stats.fouls.home}</span>
                  <span className="text-slate-700">-</span>
                  <span className="text-sm font-black text-rose-400">{state.stats.fouls.away}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Actions */}
          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#1e2d40]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Touchline Actions</h3>
            
            <button onClick={() => applyShout("Push Forward!", 2)} disabled={!isLive} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30' : 'bg-[#0f1623] text-slate-600 border border-[#1e2d40] cursor-not-allowed'}`}>
              <TrendingUp className="w-4 h-4" /> Push Forward
            </button>
            <button onClick={() => applyShout("Hold Shape!", 0)} disabled={!isLive} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' : 'bg-[#0f1623] text-slate-600 border border-[#1e2d40] cursor-not-allowed'}`}>
              <ShieldAlert className="w-4 h-4" /> Hold Shape
            </button>
            <button onClick={() => setSubModal(true)} disabled={!isLive && state.status !== "half-time"} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${(isLive || state.status === "half-time") ? 'bg-[#1e2d40] text-white hover:bg-slate-700 border border-slate-600' : 'bg-[#0f1623] text-slate-600 border border-[#1e2d40] cursor-not-allowed'}`}>
              <RefreshCw className="w-4 h-4" /> Substitution
            </button>
          </div>
        </div>

        {/* CENTER: PITCH & COMMENTARY */}
        <div className="flex-1 bg-[#080c14] p-8 flex flex-col relative overflow-hidden">
          
          {state.status === "pre-match" && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/80 backdrop-blur-sm">
              <button onClick={startMatch} className="px-10 py-5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.4)] transition hover:scale-105 active:scale-95 flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" /> Kick Off
              </button>
            </div>
          )}

          {state.status === "half-time" && !teamTalkModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/80 backdrop-blur-sm">
              <div className="bg-[#0a0f1e] border border-[#1e2d40] p-8 rounded-3xl flex flex-col items-center shadow-2xl max-w-md w-full text-center gap-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Half Time</h2>
                <p className="text-sm text-slate-400">Give a team talk before the second half begins.</p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={() => handleTeamTalk("Demand More")} className="py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl border border-rose-500/30">Demand More Focus</button>
                  <button onClick={() => handleTeamTalk("Praise")} className="py-3 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] font-bold rounded-xl border border-[#22c55e]/30">Praise Performance</button>
                </div>
              </div>
            </div>
          )}

          {state.status === "post-match" && (
            <div className="absolute inset-0 z-50 bg-[#05080f]/95 backdrop-blur-md p-10 overflow-y-auto">
              <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-20">
                <div className="text-center flex flex-col items-center gap-2">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Full Time</h2>
                  <p className="text-green-400 font-bold uppercase tracking-widest">Match Report Generated</p>
                </div>
                
                <div className="bg-[#0a0f1e] border border-[#1e2d40] p-8 rounded-3xl shadow-2xl text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {state.report || "Writing report... please wait."}
                </div>

                <button onClick={() => router.push("/game/dashboard")} className="mx-auto px-8 py-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition hover:scale-105">
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Mini Pitch Tracker */}
          <div className="flex-1 flex items-center justify-center w-full px-4">
            <div className="w-full max-w-[600px] aspect-[2/1] bg-[#166534] border-4 border-[#0f4b23] rounded-3xl relative overflow-hidden shadow-2xl flex">
              
              {/* Pitch Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <rect x="0" y="0" width="200" height="100" fill="none" stroke="white" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="white" strokeWidth="1" />
                  <circle cx="100" cy="50" r="15" fill="none" stroke="white" strokeWidth="1" />
                  <circle cx="100" cy="50" r="1" fill="white" />
                  {/* Penalty Areas */}
                  <rect x="0" y="20" width="30" height="60" fill="none" stroke="white" strokeWidth="1" />
                  <rect x="170" y="20" width="30" height="60" fill="none" stroke="white" strokeWidth="1" />
                  <circle cx="20" cy="50" r="1" fill="white" />
                  <circle cx="180" cy="50" r="1" fill="white" />
                </svg>
              </div>

              {/* Zone Highlights */}
              <div className={`w-1/3 h-full transition-colors duration-1000 ${state.currentZone === 'home-third' ? 'bg-sky-500/20' : 'bg-transparent'}`} />
              <div className={`w-1/3 h-full transition-colors duration-1000 ${state.currentZone === 'midfield' ? 'bg-white/10' : 'bg-transparent'}`} />
              <div className={`w-1/3 h-full transition-colors duration-1000 ${state.currentZone === 'away-third' ? 'bg-rose-500/20' : 'bg-transparent'}`} />

              {/* The Ball */}
              <motion.div 
                animate={{
                  left: state.currentZone === 'home-third' ? '15%' : state.currentZone === 'midfield' ? '50%' : '85%',
                  top: `${Math.random() * 40 + 30}%`
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-10 -ml-2 -mt-2"
              />
            </div>
          </div>

          {/* AI Commentary Box */}
          <div className="h-32 mt-auto bg-[#0a0f1e] border border-[#1e2d40] rounded-2xl p-4 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#22c55e]"></div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-[#22c55e]" /> Live AI Ticker
            </h4>
            <div className="flex-1 overflow-hidden flex flex-col gap-1.5 font-mono">
              <AnimatePresence>
                {state.commentaryTicker.map((line, i) => (
                  <motion.p 
                    key={line + i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: i === 0 ? 1 : 0.4, x: 0 }} 
                    className={`text-xs md:text-sm ${i === 0 ? 'text-[#22c55e] font-bold' : 'text-slate-500'}`}
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: EVENT LOG */}
        <div className="w-80 bg-[#0a0f1e] border-l border-[#1e2d40] p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
           <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#1e2d40] pb-3 flex items-center gap-2 sticky top-0 bg-[#0a0f1e] z-10">
            <Flag className="w-4 h-4 text-purple-400" /> Match Events
          </h3>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {state.events.length === 0 && (
                <div className="text-slate-500 text-[10px] font-bold uppercase text-center mt-10">Waiting for kickoff...</div>
              )}
              {state.events.map((ev, i) => (
                <motion.div 
                  key={`${ev.minute}-${i}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0f1623] border border-[#1e2d40] rounded-xl p-3 flex gap-3 shadow-md"
                >
                  <div className="font-black text-[#22c55e] text-sm shrink-0 w-6">{ev.minute}'</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {getEventIcon(ev.type)}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${ev.clubId === "HOME" ? 'text-sky-400' : 'text-rose-400'}`}>
                        {ev.clubId === "HOME" ? homeClub.shortName : awayClub.shortName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">{ev.details}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Team Talk Overlay */}
      <AnimatePresence>
        {teamTalkModal && teamTalkMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#22c55e] text-[#05080f] px-8 py-4 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.5)] flex items-center gap-3 font-black text-sm uppercase tracking-wider border-4 border-white"
          >
            <Megaphone className="w-5 h-5" />
            {teamTalkMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Modal */}
      {subModal && (
        <div className="fixed inset-0 z-[100] bg-[#05080f]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0f1e] border border-[#1e2d40] p-6 rounded-3xl w-full max-w-md flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase">Make Substitution</h3>
            <p className="text-xs text-slate-400">Select a player from your bench to bring on. (UI simplified for demo).</p>
            <button onClick={() => setSubModal(false)} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
