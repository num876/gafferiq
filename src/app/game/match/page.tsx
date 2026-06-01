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
  
  // Modifiers
  homeTacticsModifier: number; 
  homeMomentumModifier: number;
  
  // Match Engine 2.0 State
  momentum: number; // -100 (Away) to 100 (Home). 0 is neutral.
  homeFatigue: number; // 0 to 100
  awayFatigue: number; // 0 to 100
  homeRedCards: number;
  awayRedCards: number;

  report: string;

  // Visualizer Exact Positions
  ballPosition: { x: number, y: number };
  activePlayerId: string | null;
  lastAction: {
    type: "pass" | "shot" | "tackle" | "goal" | "save" | "dribble" | "foul" | "idle";
    startPos: { x: number, y: number };
    endPos: { x: number, y: number };
    color: string;
  } | null;
}

type Action = 
  | { type: "TICK"; payload: { isHome: boolean, homeStarters: Player[], awayStarters: Player[] } }
  | { type: "SET_STATUS"; payload: MatchStatus }
  | { type: "ADD_COMMENTARY"; payload: string }
  | { type: "TACTICAL_SHOUT"; payload: { attack: number, momentum: number } }
  | { type: "INIT_MOMENTUM"; payload: number }
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
  homeMomentumModifier: 0,
  momentum: 0,
  homeFatigue: 0,
  awayFatigue: 0,
  homeRedCards: 0,
  awayRedCards: 0,
  report: "",
  ballPosition: { x: 50, y: 50 },
  activePlayerId: null,
  lastAction: null
};

// --- MATCH ENGINE 2.0 HELPERS ---
const generateAttributes = (player: Player) => {
  return {
    pac: player.pace || player.overall,
    sho: player.shooting || player.overall,
    pas: player.passing || player.overall,
    def: player.defending || player.overall,
    phy: player.physical || player.overall
  };
};

const calculateMidfieldControl = (starters: Player[], fatigue: number, redCards: number) => {
  const mids = starters.filter(p => p.position === "MID");
  const players = mids.length > 0 ? mids : starters;
  const raw = players.reduce((s, p) => {
    const attr = generateAttributes(p);
    return s + (attr.pas * 0.6 + attr.phy * 0.4);
  }, 0) / players.length;
  return Math.max(10, raw - (fatigue * 0.3) - (redCards * 15));
};

const calculateAttackThreat = (starters: Player[], fatigue: number, redCards: number) => {
  const atts = starters.filter(p => p.position === "ATT" || p.position === "MID");
  const players = atts.length > 0 ? atts : starters;
  const raw = players.reduce((s, p) => {
    const attr = generateAttributes(p);
    return s + (attr.sho * 0.6 + attr.pac * 0.4);
  }, 0) / players.length;
  return Math.max(10, raw - (fatigue * 0.4) - (redCards * 10));
};

const calculateDefenseSolid = (starters: Player[], fatigue: number, redCards: number) => {
  const defs = starters.filter(p => p.position === "DEF" || p.position === "GK");
  const players = defs.length > 0 ? defs : starters;
  const raw = players.reduce((s, p) => {
    const attr = generateAttributes(p);
    return s + (attr.def * 0.7 + attr.phy * 0.3);
  }, 0) / players.length;
  return Math.max(10, raw - (fatigue * 0.5) - (redCards * 15));
};

const pickPlayerByPosition = (starters: Player[], positions: string[]) => {
  const pool = starters.filter(p => positions.includes(p.position));
  if (pool.length === 0) return starters[Math.floor(Math.random() * starters.length)];
  return pool[Math.floor(Math.random() * pool.length)];
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
    case "INIT_MOMENTUM":
      return { ...state, momentum: action.payload };
    case "TACTICAL_SHOUT":
      return { ...state, homeTacticsModifier: action.payload.attack, homeMomentumModifier: action.payload.momentum };
    case "SET_REPORT":
      return { ...state, report: action.payload };
    case "TICK":
      if (state.status !== "first-half" && state.status !== "second-half") return state;
      if (state.clock >= 45 && state.status === "first-half") return state;
      if (state.clock >= 90 && state.status === "second-half") return state;

      const nextClock = state.clock + 1;
      const { isHome, homeStarters, awayStarters } = action.payload;

      const newState = { ...state, clock: nextClock };
      
      // Fatigue accumulation
      newState.homeFatigue += (0.5 + (state.homeMomentumModifier > 0 ? 0.3 : 0)); // Pressing drains fatigue faster
      newState.awayFatigue += 0.5;

      // Calculate granular phase strengths
      const homeMid = calculateMidfieldControl(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeMomentumModifier;
      const awayMid = calculateMidfieldControl(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      const homeAtt = calculateAttackThreat(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeTacticsModifier;
      const awayAtt = calculateAttackThreat(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      const homeDef = calculateDefenseSolid(homeStarters, newState.homeFatigue, newState.homeRedCards) - (newState.homeTacticsModifier > 0 ? 10 : 0); // Attacking leaves defense open
      const awayDef = calculateDefenseSolid(awayStarters, newState.awayFatigue, newState.awayRedCards);

      // 1. Momentum Shift (Midfield Duel)
      const midRatio = homeMid / (homeMid + awayMid);
      const momentumShift = (Math.random() * 20) * (midRatio > 0.5 ? 1 : -1);
      
      // Update Momentum (-100 to 100)
      newState.momentum = Math.max(-100, Math.min(100, newState.momentum + momentumShift));
      
      // Decay momentum towards 0 naturally
      if (newState.momentum > 0) newState.momentum -= 2;
      if (newState.momentum < 0) newState.momentum += 2;

      // Update Zone based on Momentum
      if (newState.momentum > 40) newState.currentZone = "away-third"; // Home is attacking
      else if (newState.momentum < -40) newState.currentZone = "home-third"; // Away is attacking
      else newState.currentZone = "midfield";

      // Possession Stats
      const homePossProb = midRatio * 100;
      newState.stats.possession.home = Math.floor((state.stats.possession.home * 9 + homePossProb) / 10);
      newState.stats.possession.away = 100 - newState.stats.possession.home;

      // 2. Advanced Incident Generation & Positioning
      const homeIsAttacking = newState.currentZone === "away-third";
      const awayIsAttacking = newState.currentZone === "home-third";
      
      newState.lastAction = null; // default idle

      // Determine possessor
      const possessingTeam = newState.momentum > 0 ? homeStarters : awayStarters;
      
      if (newState.currentZone === "midfield") {
        const passRoll = Math.random();
        if (passRoll > 0.3) {
           const p1 = pickPlayerByPosition(possessingTeam, ["MID", "DEF"]);
           const p2 = pickPlayerByPosition(possessingTeam, ["MID", "ATT"]);
           newState.activePlayerId = p2.id;
           newState.lastAction = { type: "pass", startPos: {x: 50, y: 50}, endPos: {x: 50, y: 50}, color: "rgba(255,255,255,0.4)" };
        }
      } else if (homeIsAttacking || awayIsAttacking) {
        const attackProb = 0.40; // 40% chance of an event when in final third
        if (Math.random() < attackProb) {
          const attackRep = homeIsAttacking ? homeAtt : awayAtt;
          const defenseRep = homeIsAttacking ? awayDef : homeDef;
          const duelRatio = attackRep / (attackRep + defenseRep);
          
          const roll = Math.random();
          const attStarters = homeIsAttacking ? homeStarters : awayStarters;
          const defStarters = homeIsAttacking ? awayStarters : homeStarters;
          
          const shooter = pickPlayerByPosition(attStarters, ["ATT", "MID"]);
          const assister = pickPlayerByPosition(attStarters, ["MID", "DEF", "ATT"]);
          newState.activePlayerId = shooter.id;

          // Spatial coordinates for actions
          const startX = homeIsAttacking ? 75 : 25;
          const endX = homeIsAttacking ? 100 : 0;
          const centerY = 50 + (Math.random() * 20 - 10);

          if (roll < duelRatio * 0.3) {
            // GOAL
            if (homeIsAttacking) {
              newState.homeScore++;
              newState.stats.shots.home++;
              newState.stats.shotsOnTarget.home++;
            } else {
              newState.awayScore++;
              newState.stats.shots.away++;
              newState.stats.shotsOnTarget.away++;
            }
            
            const hasAssist = Math.random() < 0.7 && assister.id !== shooter.id;
            const assistText = hasAssist ? ` Assisted by a wonderful ball from ${assister.name}.` : "";

            newState.events = [{
              minute: nextClock, type: "Goal", clubId: homeIsAttacking ? "HOME" : "AWAY", 
              playerName: shooter.name, assistName: hasAssist ? assister.name : undefined,
              details: `${shooter.name} fires a sensational strike into the back of the net!${assistText}`
            }, ...newState.events];
            
            newState.momentum = 0; 
            newState.currentZone = "midfield";
            newState.lastAction = { type: "goal", startPos: {x: startX, y: centerY}, endPos: {x: endX, y: 50}, color: "#22c55e" };
            newState.ballPosition = {x: 50, y: 50}; // Reset to center

          } else if (roll < duelRatio * 0.7) {
            // SHOT SAVED
            if (homeIsAttacking) {
              newState.stats.shots.home++;
              newState.stats.shotsOnTarget.home++;
              newState.stats.corners.home += Math.random() > 0.5 ? 1 : 0;
            } else {
              newState.stats.shots.away++;
              newState.stats.shotsOnTarget.away++;
              newState.stats.corners.away += Math.random() > 0.5 ? 1 : 0;
            }
            newState.events = [{
              minute: nextClock, type: "Shot Saved", clubId: homeIsAttacking ? "HOME" : "AWAY", 
              playerName: shooter.name, details: `Brilliant save to deny ${shooter.name}'s powerful effort.`
            }, ...newState.events];
            
            newState.momentum = homeIsAttacking ? 20 : -20; 
            newState.lastAction = { type: "save", startPos: {x: startX, y: centerY}, endPos: {x: endX, y: 50}, color: "#38bdf8" };

          } else {
            // MISS / TACKLE
            if (homeIsAttacking) newState.stats.shots.home++;
            else newState.stats.shots.away++;
            
            newState.momentum = homeIsAttacking ? -30 : 30; 
            newState.lastAction = { type: "tackle", startPos: {x: startX, y: centerY}, endPos: {x: startX, y: centerY}, color: "#f43f5e" };
          }
        } else {
          // Normal Passing in final third
          const attStarters = homeIsAttacking ? homeStarters : awayStarters;
          const p1 = pickPlayerByPosition(attStarters, ["MID", "ATT"]);
          newState.activePlayerId = p1.id;
          newState.lastAction = { type: "pass", startPos: {x: homeIsAttacking ? 60 : 40, y: 50}, endPos: {x: homeIsAttacking ? 80 : 20, y: 50}, color: "rgba(255,255,255,0.3)" };
        }
      }

      // 3. Random Events (Fouls, Cards, Injuries)
      if (Math.random() < 0.03) {
        const homeFoul = Math.random() > 0.5;
        const foulStarters = homeFoul ? homeStarters : awayStarters;
        const fouler = pickPlayerByPosition(foulStarters, ["DEF", "MID"]);
        
        if (homeFoul) newState.stats.fouls.home++;
        else newState.stats.fouls.away++;

        const cardRoll = Math.random();
        if (cardRoll < 0.02) { // 2% of fouls are Red Cards
          if (homeFoul) newState.homeRedCards++;
          else newState.awayRedCards++;
          newState.events = [{
            minute: nextClock, type: "Red Card", clubId: homeFoul ? "HOME" : "AWAY", 
            playerName: fouler.name, details: `A shocking tackle! ${fouler.name} is sent off with a straight red card!`
          }, ...newState.events];
        } else if (cardRoll < 0.25) { // 23% of fouls are Yellow Cards
          newState.events = [{
            minute: nextClock, type: "Yellow Card", clubId: homeFoul ? "HOME" : "AWAY", 
            playerName: fouler.name, details: `Yellow card for ${fouler.name} after a cynical challenge.`
          }, ...newState.events];
        }
      }

      return newState;
    default:
      return state;
  }
}

// Helper to calculate raw team strength (kept for backward compatibility if needed elsewhere)
const getStrength = (starters: Player[]) => starters.reduce((s, p) => s + p.overall, 0) / starters.length;

// --- COMPONENT ---

const getPlayerPosition = (player: Player, isHome: boolean, index: number, zone: Zone) => {
  let baseY = 15 + (index * 7);
  let baseX = isHome ? 30 : 70;
  
  if (player.position === "GK") { baseX = isHome ? 5 : 95; baseY = 50; }
  else if (player.position === "DEF") baseX = isHome ? 20 : 80;
  else if (player.position === "MID") baseX = isHome ? 50 : 50;
  else if (player.position === "ATT") baseX = isHome ? 75 : 25;

  // Shift dynamically based on possession zone
  if (zone === "home-third") {
     if (isHome) baseX -= 5;
     else baseX -= 15;
  } else if (zone === "away-third") {
     if (isHome) baseX += 15;
     else baseX += 5;
  }

  // Slight jitter
  const jitterX = Math.random() * 6 - 3;
  const jitterY = Math.random() * 10 - 5;

  return { x: Math.min(100, Math.max(0, baseX + jitterX)), y: Math.min(100, Math.max(0, baseY + jitterY)) };
};

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

  const homeSquad = activeSave.players.filter(p => p.clubId === homeClub.id && !p.isAcademy);
  const awaySquad = activeSave.players.filter(p => p.clubId === awayClub.id && !p.isAcademy);

  // We memoize starters so they don't regenerate every render
  const homeLineups = useRef(autoSelectLineup(homeSquad, "4-3-3"));
  const awayLineups = useRef(autoSelectLineup(awaySquad, "4-3-3"));

  
  

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
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters } });

      }, 1000); // 1 real sec = 1 game min
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.clock]);

  const startMatch = () => {
    // Calculate Average Sharpness
    const homeSharpness = homeLineups.current.starters.reduce((acc, p) => acc + (p.sharpness || 50), 0) / 11;
    const awaySharpness = awayLineups.current.starters.reduce((acc, p) => acc + (p.sharpness || 50), 0) / 11;
    
    // Convert difference to momentum advantage (max ~30 momentum swing)
    const sharpnessDiff = homeSharpness - awaySharpness;
    const initialMomentum = isHome ? (sharpnessDiff * 1.5) : (-sharpnessDiff * 1.5);
    
    dispatch({ type: "INIT_MOMENTUM", payload: Math.max(-50, Math.min(50, initialMomentum)) });
    dispatch({ type: "ADD_COMMENTARY", payload: `Teams take the field. Home Sharpness: ${Math.round(homeSharpness)}% | Away Sharpness: ${Math.round(awaySharpness)}%` });
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

  const applyShout = (intent: string, attackMod: number, momentumMod: number) => {
    dispatch({ type: "TACTICAL_SHOUT", payload: { attack: attackMod, momentum: momentumMod } });
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
      <div className="h-28 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 flex items-center justify-center px-12 relative shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Home */}
        <div className="flex items-center gap-6 absolute left-12">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">{homeClub.shortName}</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{homeClub.league}</span>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] text-3xl font-black border border-white/20 transform transition hover:scale-105" style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}>
            {homeClub.name.charAt(0)}
          </div>
        </div>

        {/* Center Score */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-10 py-3 rounded-3xl flex items-center gap-8 shadow-inner ring-1 ring-white/5">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">{state.homeScore}</span>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">{state.awayScore}</span>
          </div>
          <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${isLive ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>
            {isLive && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
            {!isLive && <Clock className="w-3.5 h-3.5" />}
            {displayClock}
          </div>
        </div>

        {/* Away */}
        <div className="flex items-center gap-6 absolute right-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] text-3xl font-black border border-white/20 transform transition hover:scale-105" style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}>
            {awayClub.name.charAt(0)}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">{awayClub.shortName}</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Away</span>
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
            
            <button onClick={() => applyShout("Push Forward!", 10, 20)} disabled={!isLive} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30' : 'bg-[#0f1623] text-slate-600 border border-[#1e2d40] cursor-not-allowed'}`}>
              <TrendingUp className="w-4 h-4" /> Push Forward
            </button>
            <button onClick={() => applyShout("Hold Shape!", -5, 0)} disabled={!isLive} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' : 'bg-[#0f1623] text-slate-600 border border-[#1e2d40] cursor-not-allowed'}`}>
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

          {/* Advanced SVG Pitch Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4 relative">
            <div className="w-full max-w-[800px] aspect-[2/1] bg-[#166534] rounded-xl relative overflow-hidden shadow-2xl flex border-4 border-[#0f4b23]">
              
              {/* Detailed SVG Pitch Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-50">
                <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="none">
                  {/* Outer Boundary */}
                  <rect x="0" y="0" width="1000" height="500" fill="none" stroke="white" strokeWidth="3" />
                  
                  {/* Halfway Line */}
                  <line x1="500" y1="0" x2="500" y2="500" stroke="white" strokeWidth="3" />
                  
                  {/* Centre Circle */}
                  <circle cx="500" cy="250" r="80" fill="none" stroke="white" strokeWidth="3" />
                  <circle cx="500" cy="250" r="4" fill="white" />
                  
                  {/* Left Penalty Area */}
                  <rect x="0" y="100" width="160" height="300" fill="none" stroke="white" strokeWidth="3" />
                  <rect x="0" y="180" width="50" height="140" fill="none" stroke="white" strokeWidth="3" />
                  <circle cx="110" cy="250" r="3" fill="white" />
                  <path d="M 160 190 A 80 80 0 0 1 160 310" fill="none" stroke="white" strokeWidth="3" />
                  
                  {/* Right Penalty Area */}
                  <rect x="840" y="100" width="160" height="300" fill="none" stroke="white" strokeWidth="3" />
                  <rect x="950" y="180" width="50" height="140" fill="none" stroke="white" strokeWidth="3" />
                  <circle cx="890" cy="250" r="3" fill="white" />
                  <path d="M 840 190 A 80 80 0 0 0 840 310" fill="none" stroke="white" strokeWidth="3" />

                  {/* Corner Arcs */}
                  <path d="M 0 15 A 15 15 0 0 0 15 0" fill="none" stroke="white" strokeWidth="3" />
                  <path d="M 1000 15 A 15 15 0 0 1 985 0" fill="none" stroke="white" strokeWidth="3" />
                  <path d="M 0 485 A 15 15 0 0 1 15 500" fill="none" stroke="white" strokeWidth="3" />
                  <path d="M 1000 485 A 15 15 0 0 0 985 500" fill="none" stroke="white" strokeWidth="3" />
                </svg>
              </div>

              {/* Dynamic Grass Stripes */}
              <div className="absolute inset-0 flex pointer-events-none opacity-20 mix-blend-overlay">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>

              {/* Zone Gradients for Visual Flair */}
              <div className={`w-1/3 h-full transition-opacity duration-1000 ${state.currentZone === 'home-third' ? 'bg-gradient-to-r from-rose-500/30 to-transparent opacity-100' : 'opacity-0'}`} />
              <div className={`w-1/3 h-full transition-opacity duration-1000 ${state.currentZone === 'midfield' ? 'bg-white/5 opacity-100' : 'opacity-0'}`} />
              <div className={`w-1/3 h-full transition-opacity duration-1000 ${state.currentZone === 'away-third' ? 'bg-gradient-to-l from-rose-500/30 to-transparent opacity-100' : 'opacity-0'}`} />

              {/* Dynamic Action Animations */}
              <AnimatePresence>
                {state.lastAction && state.lastAction.type !== "idle" && (
                  <motion.div 
                    key={state.clock + state.lastAction.type}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute inset-0 z-10 pointer-events-none"
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.line 
                        x1={`${state.lastAction.startPos.x}%`} 
                        y1={`${state.lastAction.startPos.y}%`} 
                        x2={`${state.lastAction.endPos.x}%`} 
                        y2={`${state.lastAction.endPos.y}%`} 
                        stroke={state.lastAction.color} 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Ball */}
              <motion.div 
                animate={{
                  left: state.currentZone === 'home-third' ? '15%' : state.currentZone === 'midfield' ? '50%' : '85%',
                  top: `${Math.random() * 60 + 20}%`,
                  scale: state.lastAction?.type === "goal" ? [1, 1.5, 1] : 1
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-30 -ml-2 -mt-2 flex items-center justify-center overflow-hidden border border-slate-300"
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full opacity-50" />
              </motion.div>

              {/* Home Team Dots */}
              {homeLineups.current.starters.map((p, i) => {
                const pos = getPlayerPosition(p, true, i, state.currentZone);
                const isActive = state.activePlayerId === p.id;
                return (
                  <motion.div
                    key={`home-${p.id}`}
                    animate={{ left: `${pos.x}%`, top: `${pos.y}%`, scale: isActive ? 1.5 : 1 }}
                    transition={{ type: "spring", stiffness: 40, damping: 25 }}
                    className={`absolute w-3 h-3 rounded-full border ${isActive ? 'border-white z-30' : 'border-white/50 z-20'} -ml-1.5 -mt-1.5 group cursor-pointer`}
                    style={{ backgroundColor: homeClub.primaryColor }}
                  >
                     <div className="absolute opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[8px] whitespace-nowrap px-1 py-0.5 rounded -top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                       {p.name} ({p.position})
                     </div>
                  </motion.div>
                );
              })}

              {/* Away Team Dots */}
              {awayLineups.current.starters.map((p, i) => {
                const pos = getPlayerPosition(p, false, i, state.currentZone);
                const isActive = state.activePlayerId === p.id;
                return (
                  <motion.div
                    key={`away-${p.id}`}
                    animate={{ left: `${pos.x}%`, top: `${pos.y}%`, scale: isActive ? 1.5 : 1 }}
                    transition={{ type: "spring", stiffness: 40, damping: 25 }}
                    className={`absolute w-3 h-3 rounded-full border ${isActive ? 'border-white z-30' : 'border-white/50 z-20'} -ml-1.5 -mt-1.5 group cursor-pointer`}
                    style={{ backgroundColor: awayClub.primaryColor }}
                  >
                     <div className="absolute opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[8px] whitespace-nowrap px-1 py-0.5 rounded -top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                       {p.name} ({p.position})
                     </div>
                  </motion.div>
                );
              })}

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
        <div className="w-96 bg-slate-900/60 backdrop-blur-2xl border-l border-slate-800/50 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10">
           <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2 sticky top-0 bg-transparent z-10 backdrop-blur-3xl">
            <Flag className="w-4 h-4 text-purple-400" /> Match Events
          </h3>

          <div className="flex flex-col gap-4 relative mt-2">
            {/* Timeline Track */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-700 via-slate-600 to-transparent pointer-events-none" />

            <AnimatePresence>
              {state.events.length === 0 && (
                <div className="text-slate-500 text-[10px] font-bold uppercase text-center mt-10 w-full">Waiting for kickoff...</div>
              )}
              {[...state.events].reverse().map((ev, i) => {
                const isHome = ev.clubId === "HOME";
                const clubColor = isHome ? homeClub.primaryColor : awayClub.primaryColor;
                
                return (
                  <motion.div 
                    key={`${ev.minute}-${i}`}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="relative flex gap-4 w-full group"
                  >
                    {/* Time Node */}
                    <div className="relative z-10 flex flex-col items-center mt-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg group-hover:border-white/50 transition-colors">
                        <span className="font-black text-xs text-white">{ev.minute}'</span>
                      </div>
                    </div>

                    {/* Event Card */}
                    <div className="flex-1 bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg hover:bg-slate-800/60 transition duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventIcon(ev.type)}
                        <span 
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${clubColor}30`, color: clubColor }}
                        >
                          {isHome ? homeClub.shortName : awayClub.shortName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{ev.details}</p>
                    </div>
                  </motion.div>
                );
              })}
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
