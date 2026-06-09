"use client";

import React, { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { MatchEvent, MatchStats } from "../../../db/storage";
import { Player, Club } from "../../../config/seededData";
import { autoSelectLineup, simulateMatchHeuristic } from "../../../engine/simulator";
import { 
  Play, Check, MessageSquare, Clock, ShieldAlert, Award, 
  Activity, RefreshCw, Volume2, TrendingUp, Megaphone, Flag,
  ChevronRight, Zap, Radio, Star
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
  commentaryFeed: string[]; // Full rolling feed (not just ticker)
  commentaryTicker: string[]; // 3-line ticker for backward compat
  
  homeTacticsModifier: number; 
  homeMomentumModifier: number;
  
  momentum: number;
  homeFatigue: number;
  awayFatigue: number;
  homeRedCards: number;
  awayRedCards: number;

  report: string;

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
  | { type: "TICK"; payload: { isHome: boolean, homeStarters: Player[], awayStarters: Player[], homeTactics: any, awayTactics: any } } 
  | { type: 'SUBSTITUTION'; payload: { clock: number; clubId: string; pOn: Player; pOff: Player } }
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
  commentaryFeed: [],
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

// --- MATCH ENGINE HELPERS ---
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

// Short punchy commentary lines for auto-generation
const getMidfieldCommentary = (homeName: string, awayName: string, zone: Zone) => {
  const lines = [
    `Ball being recycled in midfield as both teams probe for openings.`,
    `${zone === 'midfield' ? 'Tight battle in the centre of the pitch.' : zone === 'away-third' ? `${homeName} building pressure in the final third.` : `${awayName} pressing high up the pitch.`}`,
    `The tempo of the game shifts momentarily.`,
    `Both midfields are working hard to establish control.`,
    `Play continues in the ${zone === 'midfield' ? 'centre circle' : zone === 'away-third' ? `${homeName} half` : `${awayName} half`}.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
};

function matchReducer(state: MatchState, action: Action): MatchState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "ADD_COMMENTARY": {
      const newLine = action.payload;
      return { 
        ...state, 
        commentaryFeed: [newLine, ...state.commentaryFeed].slice(0, 100),
        commentaryTicker: [newLine, ...state.commentaryTicker].slice(0, 3)
      };
    }
    case "INIT_MOMENTUM":
      return { ...state, momentum: action.payload };
    case "TACTICAL_SHOUT":
      return { ...state, homeTacticsModifier: action.payload.attack, homeMomentumModifier: action.payload.momentum };
    case "SET_REPORT":
      return { ...state, report: action.payload };
    case "SUBSTITUTION":
      return {
        ...state,
        events: [{
          minute: action.payload.clock,
          type: "Substitution",
          clubId: action.payload.clubId,
          playerName: action.payload.pOn.name,
          assistName: action.payload.pOff.name,
          details: `Substitution: ${action.payload.pOn.name} replaces ${action.payload.pOff.name}.`
        }, ...state.events]
      };
    case "TICK": {
      if (state.status !== "first-half" && state.status !== "second-half") return state;
      if (state.clock >= 45 && state.status === "first-half") return state;
      if (state.clock >= 90 && state.status === "second-half") return state;

      const nextClock = state.clock + 1;
      const { isHome, homeStarters, awayStarters, homeTactics, awayTactics } = action.payload;

      const newState = { ...state, clock: nextClock };
      
      newState.homeFatigue += (0.5 + (state.homeMomentumModifier > 0 ? 0.3 : 0));
      newState.awayFatigue += 0.5;

      let homeMid = calculateMidfieldControl(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeMomentumModifier;
      let awayMid = calculateMidfieldControl(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      let homeAtt = calculateAttackThreat(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeTacticsModifier;
      let awayAtt = calculateAttackThreat(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      let homeDef = calculateDefenseSolid(homeStarters, newState.homeFatigue, newState.homeRedCards) - (newState.homeTacticsModifier > 0 ? 10 : 0); 
      let awayDef = calculateDefenseSolid(awayStarters, newState.awayFatigue, newState.awayRedCards);

      const applyRoleBonuses = (starters: Player[], tactics: any, att: number, mid: number, def: number) => {
        let newAtt = att; let newMid = mid; let newDef = def;
        if (!tactics || !tactics.playerRoles) return { att, mid, def };
        starters.forEach(p => {
           const role = tactics.playerRoles[p.id];
           if (!role) return;
           if (role.includes("Playmaker") || role.includes("Regista")) newMid += 3;
           if (role.includes("Anchor Man") || role.includes("Ball-Winning")) { newMid += 1; newDef += 2; }
           if (role.includes("Inverted Winger") || role.includes("Inside Forward")) newAtt += 3;
           if (role.includes("False 9")) { newAtt += 1; newMid += 2; }
           if (role.includes("Wing-Back")) { newDef += 1; newMid += 1; newAtt += 1; }
        });
        return { att: newAtt, mid: newMid, def: newDef };
      };

      const homeMods = applyRoleBonuses(homeStarters, homeTactics, homeAtt, homeMid, homeDef);
      homeAtt = homeMods.att; homeMid = homeMods.mid; homeDef = homeMods.def;
      const awayMods = applyRoleBonuses(awayStarters, awayTactics, awayAtt, awayMid, awayDef);
      awayAtt = awayMods.att; awayMid = awayMods.mid; awayDef = awayMods.def;

      const midRatio = homeMid / (homeMid + awayMid);
      const momentumShift = (Math.random() * 20) * (midRatio > 0.5 ? 1 : -1);
      newState.momentum = Math.max(-100, Math.min(100, newState.momentum + momentumShift));
      if (newState.momentum > 0) newState.momentum -= 2;
      if (newState.momentum < 0) newState.momentum += 2;

      if (newState.momentum > 40) newState.currentZone = "away-third";
      else if (newState.momentum < -40) newState.currentZone = "home-third";
      else newState.currentZone = "midfield";

      const homePossProb = midRatio * 100;
      newState.stats.possession.home = Math.floor((state.stats.possession.home * 9 + homePossProb) / 10);
      newState.stats.possession.away = 100 - newState.stats.possession.home;

      const homeIsAttacking = newState.currentZone === "away-third";
      const awayIsAttacking = newState.currentZone === "home-third";
      
      newState.lastAction = null;

      // Auto commentary every few minutes
      if (nextClock % 3 === 0) {
        const homeShortName = isHome ? "us" : "them";
        const awayShortName = !isHome ? "us" : "them";
        newState.commentaryFeed = [
          `${nextClock}' — ${getMidfieldCommentary(homeShortName, awayShortName, newState.currentZone)}`,
          ...newState.commentaryFeed
        ].slice(0, 100);
      }

      if (newState.currentZone === "midfield") {
        const possessingTeam = newState.momentum > 0 ? homeStarters : awayStarters;
        if (Math.random() > 0.3) {
          const p2 = pickPlayerByPosition(possessingTeam, ["MID", "ATT"]);
          newState.activePlayerId = p2.id;
          newState.lastAction = { type: "pass", startPos: {x: 50, y: 50}, endPos: {x: 50, y: 50}, color: "rgba(255,255,255,0.4)" };
        }
      } else if (homeIsAttacking || awayIsAttacking) {
        const attackProb = 0.40;
        if (Math.random() < attackProb) {
          const attackRep = homeIsAttacking ? homeAtt : awayAtt;
          const defenseRep = homeIsAttacking ? awayDef : homeDef;
          const duelRatio = attackRep / (attackRep + defenseRep);
          const roll = Math.random();
          const attStarters = homeIsAttacking ? homeStarters : awayStarters;

          const shooter = pickPlayerByPosition(attStarters, ["ATT", "MID"]);
          const assister = pickPlayerByPosition(attStarters, ["MID", "DEF", "ATT"]);
          newState.activePlayerId = shooter.id;

          const startX = homeIsAttacking ? 75 : 25;
          const endX = homeIsAttacking ? 100 : 0;
          const centerY = 50 + (Math.random() * 20 - 10);

          if (roll < duelRatio * 0.3) {
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
            const assistText = hasAssist ? ` Assisted by ${assister.name}.` : "";

            newState.events = [{
              minute: nextClock, type: "Goal", clubId: homeIsAttacking ? "HOME" : "AWAY", 
              playerName: shooter.name, assistName: hasAssist ? assister.name : undefined,
              details: `GOAL! ${shooter.name} fires into the net!${assistText}`
            }, ...newState.events];
            
            newState.commentaryFeed = [
              `⚽ ${nextClock}' — GOAL! ${shooter.name} has scored! ${hasAssist ? `Great assist from ${assister.name}.` : ""}`,
              ...newState.commentaryFeed
            ].slice(0, 100);
            
            newState.momentum = 0;
            newState.currentZone = "midfield";
            newState.lastAction = { type: "goal", startPos: {x: startX, y: centerY}, endPos: {x: endX, y: 50}, color: "#22c55e" };
            newState.ballPosition = {x: 50, y: 50};

          } else if (roll < duelRatio * 0.7) {
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
              playerName: shooter.name, details: `Brilliant save denies ${shooter.name}.`
            }, ...newState.events];
            newState.commentaryFeed = [
              `🧤 ${nextClock}' — Brilliant save! ${shooter.name}'s effort is denied.`,
              ...newState.commentaryFeed
            ].slice(0, 100);
            newState.momentum = homeIsAttacking ? 20 : -20; 
            newState.lastAction = { type: "save", startPos: {x: startX, y: centerY}, endPos: {x: endX, y: 50}, color: "#38bdf8" };

          } else {
            if (homeIsAttacking) newState.stats.shots.home++;
            else newState.stats.shots.away++;
            newState.commentaryFeed = [
              `💨 ${nextClock}' — ${shooter.name} fires wide. A chance wasted.`,
              ...newState.commentaryFeed
            ].slice(0, 100);
            newState.momentum = homeIsAttacking ? -30 : 30; 
            newState.lastAction = { type: "tackle", startPos: {x: startX, y: centerY}, endPos: {x: startX, y: centerY}, color: "#f43f5e" };
          }
        }
      }

      if (Math.random() < 0.03) {
        const homeFoul = Math.random() > 0.5;
        const foulStarters = homeFoul ? homeStarters : awayStarters;
        const fouler = pickPlayerByPosition(foulStarters, ["DEF", "MID"]);
        
        if (homeFoul) newState.stats.fouls.home++;
        else newState.stats.fouls.away++;

        const cardRoll = Math.random();
        if (cardRoll < 0.02) {
          if (homeFoul) newState.homeRedCards++;
          else newState.awayRedCards++;
          newState.events = [{
            minute: nextClock, type: "Red Card", clubId: homeFoul ? "HOME" : "AWAY", 
            playerName: fouler.name, details: `${fouler.name} sees RED! A straight red card.`
          }, ...newState.events];
          newState.commentaryFeed = [
            `🟥 ${nextClock}' — RED CARD! ${fouler.name} is sent off!`,
            ...newState.commentaryFeed
          ].slice(0, 100);
        } else if (cardRoll < 0.25) {
          newState.events = [{
            minute: nextClock, type: "Yellow Card", clubId: homeFoul ? "HOME" : "AWAY", 
            playerName: fouler.name, details: `Yellow card for ${fouler.name}.`
          }, ...newState.events];
          newState.commentaryFeed = [
            `🟨 ${nextClock}' — Yellow card for ${fouler.name}.`,
            ...newState.commentaryFeed
          ].slice(0, 100);
        }
      }

      return newState;
    }
    default:
      return state;
  }
}

const getStrength = (starters: Player[]) => starters.reduce((s, p) => s + p.overall, 0) / starters.length;

// --- COMPONENT ---
export default function MatchViewer() {
  const router = useRouter();
  const { activeSave, completeLiveMatch, advanceToNextMatchday } = useGame();
  
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [teamTalkModal, setTeamTalkModal] = useState(false);
  const [teamTalkMsg, setTeamTalkMsg] = useState("");
  const [subModal, setSubModal] = useState(false);
  const [subOffId, setSubOffId] = useState<string | null>(null);

  // Quick Sim state
  const [quickSimResult, setQuickSimResult] = useState<{ homeScore: number; awayScore: number; events: MatchEvent[] } | null>(null);
  const [quickSimDone, setQuickSimDone] = useState(false);

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

  const homeLineups = useRef((() => {
    if (isHome && activeSave.tactics && activeSave.tactics.starters.length === 11) {
      return {
        starters: activeSave.tactics.starters.map(id => homeSquad.find(p => p.id === id)).filter(Boolean) as Player[],
        bench: activeSave.tactics.bench.map(id => homeSquad.find(p => p.id === id)).filter(Boolean) as Player[]
      };
    }
    return autoSelectLineup(homeSquad, "4-3-3");
  })());

  const awayLineups = useRef((() => {
    if (!isHome && activeSave.tactics && activeSave.tactics.starters.length === 11) {
      return {
        starters: activeSave.tactics.starters.map(id => awaySquad.find(p => p.id === id)).filter(Boolean) as Player[],
        bench: activeSave.tactics.bench.map(id => awaySquad.find(p => p.id === id)).filter(Boolean) as Player[]
      };
    }
    return autoSelectLineup(awaySquad, "4-3-3");
  })());

  // Ticker effect
  useEffect(() => {
    if (state.status === "first-half" || state.status === "second-half") {
      timerRef.current = setInterval(() => {
        if (state.clock === 45 && state.status === "first-half") {
          dispatch({ type: "SET_STATUS", payload: "half-time" });
          dispatch({ type: "ADD_COMMENTARY", payload: "⏱ Half Time! The referee blows the whistle." });
          clearInterval(timerRef.current!);
          return;
        }
        if (state.clock >= 90 && state.status === "second-half") {
          dispatch({ type: "SET_STATUS", payload: "post-match" });
          dispatch({ type: "ADD_COMMENTARY", payload: "🏁 Full Time! The final whistle has blown!" });
          clearInterval(timerRef.current!);
          generatePostMatchReport();
          return;
        }

        if (state.clock > 0 && state.clock % 5 === 0) {
          fetchCommentary(state.clock);
        }

        const homeT = isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        const awayT = !isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters, homeTactics: homeT, awayTactics: awayT } });

      }, 900); // Slightly faster than 1s for better feel
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.clock]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [state.commentaryFeed.length]);

  const startMatch = () => {
    const homeSharpness = homeLineups.current.starters.reduce((acc, p) => acc + (p.sharpness || 50), 0) / 11;
    const awaySharpness = awayLineups.current.starters.reduce((acc, p) => acc + (p.sharpness || 50), 0) / 11;
    const sharpnessDiff = homeSharpness - awaySharpness;
    const initialMomentum = isHome ? (sharpnessDiff * 1.5) : (-sharpnessDiff * 1.5);
    
    dispatch({ type: "INIT_MOMENTUM", payload: Math.max(-50, Math.min(50, initialMomentum)) });
    dispatch({ type: "ADD_COMMENTARY", payload: `🎙 Kickoff! ${homeClub.name} vs ${awayClub.name}. Let the game begin!` });
    dispatch({ type: "SET_STATUS", payload: "first-half" });
  };

  // QUICK SIM: Instantly run full match using the heuristic engine
  const handleQuickSim = () => {
    const homeT = isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
    const awayT = !isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
    
    const result = simulateMatchHeuristic(
      fixture, homeClub, awayClub, homeSquad, awaySquad,
      homeT as any,
      awayT as any
    );

    const mappedEvents = (result.events || []).map((e: any) => ({
      ...e,
      clubId: e.clubId === homeClub.id ? "HOME" : "AWAY"
    }));

    setQuickSimResult({ homeScore: result.homeScore ?? 0, awayScore: result.awayScore ?? 0, events: mappedEvents });
    setQuickSimDone(true);
  };

  const confirmQuickSim = () => {
    if (!quickSimResult) return;
    const mappedEvents = quickSimResult.events.map((e: any) => ({
      ...e,
      clubId: e.clubId === "HOME" ? homeClub.id : awayClub.id
    }));
    completeLiveMatch(fixture.id, {
      homeScore: quickSimResult.homeScore,
      awayScore: quickSimResult.awayScore,
      events: mappedEvents as any,
      motmId: homeLineups.current.starters[0].id
    });
    router.push("/game/dashboard");
  };

  // APIs
  const fetchCommentary = async (minute: number) => {
    try {
      const res = await fetch("/api/ai/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchState: state, homeClubName: homeClub.shortName, awayClubName: awayClub.shortName })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "ADD_COMMENTARY", payload: `🎙 ${minute}' — ${data.commentary}` });
      }
    } catch (e) {}
  };

  const handleTeamTalk = async (intent: string) => {
    setTeamTalkModal(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch("/api/ai/team-talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, homeClubName: homeClub.name, awayClubName: awayClub.name, homeScore: state.homeScore, awayScore: state.awayScore, isHome })
      });
      if (res.ok) {
        const data = await res.json();
        setTeamTalkMsg(`"${data.message}"`);
        setTimeout(() => {
          setTeamTalkModal(false);
          setTeamTalkMsg("");
          dispatch({ type: "ADD_COMMENTARY", payload: `📢 Team Talk: ${intent}` });
          if (state.status === "half-time") dispatch({ type: "SET_STATUS", payload: "second-half" });
        }, 3500);
      }
    } catch (e) {
      setTeamTalkModal(false);
      if (state.status === "half-time") dispatch({ type: "SET_STATUS", payload: "second-half" });
    }
  };

  const generatePostMatchReport = async () => {
    const mappedEvents = state.events.map(e => ({
      ...e,
      clubId: e.clubId === "HOME" ? homeClub.id : awayClub.id
    }));

    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchState: { ...state, events: mappedEvents }, homeClub, awayClub, motmName: homeLineups.current.starters[Math.floor(Math.random()*3)].name })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_REPORT", payload: data.report });
      }
    } catch (e) {}

    completeLiveMatch(fixture.id, {
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      events: mappedEvents as any,
      motmId: homeLineups.current.starters[Math.floor(Math.random()*3)].id
    });
  };

  const applyShout = (intent: string, attackMod: number, momentumMod: number) => {
    dispatch({ type: "TACTICAL_SHOUT", payload: { attack: attackMod, momentum: momentumMod } });
    dispatch({ type: "ADD_COMMENTARY", payload: `📢 MANAGER SHOUT: "${intent}"` });
  };

  const handleSubstitution = (subOnId: string) => {
    if (!subOffId) return;
    const myLineups = isHome ? homeLineups.current : awayLineups.current;
    const starterIdx = myLineups.starters.findIndex(p => p.id === subOffId);
    const benchIdx = myLineups.bench.findIndex(p => p.id === subOnId);
    
    if (starterIdx > -1 && benchIdx > -1) {
      const pOff = myLineups.starters[starterIdx];
      const pOn = myLineups.bench[benchIdx];
      myLineups.starters[starterIdx] = pOn;
      myLineups.bench[benchIdx] = pOff;
      dispatch({ type: "ADD_COMMENTARY", payload: `🔄 SUBSTITUTION: ${pOn.name} comes on for ${pOff.name}.` });
      dispatch({ type: "SUBSTITUTION", payload: { pOn, pOff, clubId: isHome ? homeClub.id : awayClub.id, clock: state.clock } });
    }
    setSubOffId(null);
    setSubModal(false);
  };

  // --- RENDER HELPERS ---
  const getEventIcon = (type: string) => {
    switch(type) {
      case "Goal": return <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>;
      case "Yellow Card": return <div className="w-3.5 h-5 rounded bg-yellow-400 mx-0.5 shadow-sm shrink-0" />;
      case "Red Card": return <div className="w-3.5 h-5 rounded bg-red-500 mx-0.5 shadow-sm shrink-0" />;
      case "Shot Saved": return <Activity className="w-5 h-5 text-blue-400 shrink-0" />;
      case "Substitution": return <RefreshCw className="w-5 h-5 text-slate-400 shrink-0" />;
      default: return <MessageSquare className="w-5 h-5 text-slate-400 shrink-0" />;
    }
  };

  const isLive = state.status === "first-half" || state.status === "second-half";
  const displayClock = state.status === "pre-match" ? "00:00" : state.status === "post-match" ? "FT" : state.status === "half-time" ? "HT" : `${state.clock.toString().padStart(2, '0')}'`;

  // Player score for pre-match card
  const homeAvgOvr = Math.round(homeLineups.current.starters.reduce((s, p) => s + p.overall, 0) / Math.max(1, homeLineups.current.starters.length));
  const awayAvgOvr = Math.round(awayLineups.current.starters.reduce((s, p) => s + p.overall, 0) / Math.max(1, awayLineups.current.starters.length));

  return (
    <div className="flex flex-col w-full h-[calc(100vh-0px)] font-sans overflow-hidden bg-[#05080f]">
      
      {/* TOP SCOREBOARD */}
      <div className="h-24 bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-center px-8 relative shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Home */}
        <div className="flex items-center gap-4 absolute left-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border border-white/20 shadow-lg"
            style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}
          >
            {homeClub.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white uppercase tracking-tight">{homeClub.shortName}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{homeClub.league}</span>
          </div>
        </div>

        {/* Center Score */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-8 py-2 rounded-2xl flex items-center gap-6 shadow-inner ring-1 ring-white/5">
            <span className="text-4xl font-black text-white tabular-nums">{quickSimDone ? quickSimResult?.homeScore : state.homeScore}</span>
            <div className="w-px h-8 bg-white/20" />
            <span className="text-4xl font-black text-white tabular-nums">{quickSimDone ? quickSimResult?.awayScore : state.awayScore}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
            isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
            : quickSimDone ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
          }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {!isLive && !quickSimDone && <Clock className="w-3 h-3" />}
            {quickSimDone ? "SIM RESULT" : displayClock}
          </div>
        </div>

        {/* Away */}
        <div className="flex items-center gap-4 absolute right-8">
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-white uppercase tracking-tight">{awayClub.shortName}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Away</span>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border border-white/20 shadow-lg"
            style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}
          >
            {awayClub.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: STATS + CONTROLS */}
        <div className="w-72 bg-[#0a0f1e] border-r border-[#1e2d40] p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          
          {/* Match Stats */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Match Stats
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Possession", home: state.stats.possession.home, away: state.stats.possession.away, format: (v: number) => `${Math.round(v)}%` },
                { label: "Shots", home: state.stats.shots.home, away: state.stats.shots.away, format: (v: number) => `${v}` },
                { label: "On Target", home: state.stats.shotsOnTarget.home, away: state.stats.shotsOnTarget.away, format: (v: number) => `${v}` },
                { label: "Corners", home: state.stats.corners.home, away: state.stats.corners.away, format: (v: number) => `${v}` },
                { label: "Fouls", home: state.stats.fouls.home, away: state.stats.fouls.away, format: (v: number) => `${v}` },
              ].map(stat => {
                const total = Math.max(1, stat.home + stat.away);
                const homePct = (stat.home / total) * 100;
                return (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[10px] font-bold text-white mb-1.5">
                      <span className="text-sky-400">{stat.format(stat.home)}</span>
                      <span className="text-slate-500 uppercase tracking-widest text-[9px]">{stat.label}</span>
                      <span className="text-rose-400">{stat.format(stat.away)}</span>
                    </div>
                    <div className="flex h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: `${homePct}%` }} />
                      <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${100 - homePct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Momentum Bar */}
          {isLive && (
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Momentum</div>
              <div className="flex h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${Math.max(5, 50 + state.momentum / 2)}%` }} />
                <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${Math.max(5, 50 - state.momentum / 2)}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                <span>{homeClub.shortName}</span>
                <span>{awayClub.shortName}</span>
              </div>
            </div>
          )}

          {/* Manager Touchline Actions */}
          <div className="mt-auto pt-4 border-t border-[#1e2d40]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Touchline</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => applyShout("Push Forward!", 10, 20)} disabled={!isLive} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/25' : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'}`}>
                <TrendingUp className="w-3.5 h-3.5" /> Push Forward
              </button>
              <button onClick={() => applyShout("Hold Shape!", -5, 0)} disabled={!isLive} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/25' : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'}`}>
                <ShieldAlert className="w-3.5 h-3.5" /> Hold Shape
              </button>
              <button onClick={() => applyShout("Get It Wide!", 5, 10)} disabled={!isLive} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${isLive ? 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/25' : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'}`}>
                <ChevronRight className="w-3.5 h-3.5" /> Get It Wide
              </button>
              <button onClick={() => setSubModal(true)} disabled={!isLive && state.status !== "half-time"} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${(isLive || state.status === "half-time") ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600' : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'}`}>
                <RefreshCw className="w-3.5 h-3.5" /> Substitution
              </button>
            </div>
          </div>
        </div>

        {/* CENTER: COMMENTARY FEED */}
        <div className="flex-1 flex flex-col bg-[#080c14] overflow-hidden relative">
          
          {/* PRE-MATCH OVERLAY */}
          {state.status === "pre-match" && !quickSimDone && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/90 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl flex flex-col items-center shadow-2xl max-w-lg w-full gap-8 text-center mx-4"
              >
                {/* Team comparison */}
                <div className="flex items-center justify-center gap-6 w-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/20 shadow-xl" style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}>
                      {homeClub.name.charAt(0)}
                    </div>
                    <span className="text-white font-black text-sm">{homeClub.shortName}</span>
                    <span className="text-slate-400 text-xs">{homeAvgOvr} OVR</span>
                  </div>
                  <div className="text-slate-500 font-black text-2xl">VS</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/20 shadow-xl" style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}>
                      {awayClub.name.charAt(0)}
                    </div>
                    <span className="text-white font-black text-sm">{awayClub.shortName}</span>
                    <span className="text-slate-400 text-xs">{awayAvgOvr} OVR</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm">Choose how to play this match</p>

                {/* Two CTA buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={startMatch}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.3)] transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Radio className="w-5 h-5" /> Play Match Live
                  </button>
                  <button
                    onClick={handleQuickSim}
                    className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base uppercase tracking-widest border border-slate-600 transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5 text-amber-400" /> Quick Sim
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Matchday {activeSave.currentMatchday}</p>
              </motion.div>
            </div>
          )}

          {/* QUICK SIM RESULT OVERLAY */}
          {quickSimDone && quickSimResult && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl flex flex-col items-center shadow-2xl max-w-lg w-full gap-6 text-center mx-4"
              >
                <div className="flex items-center gap-3 text-amber-400">
                  <Zap className="w-6 h-6" />
                  <span className="font-black text-sm uppercase tracking-widest">Simulation Complete</span>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border border-white/20" style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}>
                      {homeClub.name.charAt(0)}
                    </div>
                    <span className="text-slate-300 font-bold text-sm">{homeClub.shortName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-white tabular-nums">{quickSimResult.homeScore}</span>
                    <span className="text-slate-600 text-3xl font-light">-</span>
                    <span className="text-6xl font-black text-white tabular-nums">{quickSimResult.awayScore}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border border-white/20" style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}>
                      {awayClub.name.charAt(0)}
                    </div>
                    <span className="text-slate-300 font-bold text-sm">{awayClub.shortName}</span>
                  </div>
                </div>

                {/* Key events */}
                {quickSimResult.events.filter(e => e.type === "Goal").length > 0 && (
                  <div className="w-full bg-slate-800/50 rounded-xl p-4 text-left space-y-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Goalscorers</div>
                    {quickSimResult.events.filter(e => e.type === "Goal").map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className={`font-bold ${e.clubId === "HOME" ? "text-sky-300" : "text-rose-300"}`}>{e.playerName}</span>
                        <span className="text-slate-500">{e.minute}'</span>
                        {e.clubId === "HOME" ? (
                          <span className="text-[10px] text-slate-500 ml-auto">{homeClub.shortName}</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 ml-auto">{awayClub.shortName}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={confirmQuickSim}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Accept Result & Continue
                </button>
              </motion.div>
            </div>
          )}

          {/* HALF TIME OVERLAY */}
          {state.status === "half-time" && !teamTalkModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/90 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center shadow-2xl max-w-md w-full text-center gap-6 mx-4"
              >
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Half Time</h2>
                <div className="flex items-center gap-6 text-4xl font-black text-white">
                  <span className="text-sky-300">{state.homeScore}</span>
                  <span className="text-slate-600">-</span>
                  <span className="text-rose-300">{state.awayScore}</span>
                </div>
                <p className="text-sm text-slate-400">Deliver your team talk before the second half.</p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={() => handleTeamTalk("Demand More")} className="py-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold rounded-xl border border-rose-500/25 transition">💢 Demand More</button>
                  <button onClick={() => handleTeamTalk("Praise")} className="py-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold rounded-xl border border-emerald-500/25 transition">👏 Praise the Effort</button>
                  <button onClick={() => { dispatch({ type: "SET_STATUS", payload: "second-half" }); }} className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition">⚽ No Talk — Straight Out</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* POST MATCH OVERLAY */}
          {state.status === "post-match" && (
            <div className="absolute inset-0 z-50 bg-[#05080f]/95 backdrop-blur-md p-8 overflow-y-auto">
              <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-20">
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Full Time</h2>
                  <div className="flex items-center gap-6 text-5xl font-black text-white mt-2">
                    <span className="text-sky-300">{state.homeScore}</span>
                    <span className="text-slate-600">-</span>
                    <span className="text-rose-300">{state.awayScore}</span>
                  </div>
                </div>
                
                <div className="bg-[#0a0f1e] border border-[#1e2d40] p-6 rounded-2xl shadow-2xl text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {state.report || <span className="text-slate-500 italic">Generating match report with AI...</span>}
                </div>

                <button onClick={() => router.push("/game/dashboard")} className="mx-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition hover:scale-105 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5" /> Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* LIVE COMMENTARY FEED */}
          <div className="p-5 border-b border-slate-800/50 shrink-0 flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {isLive ? "Live Commentary Feed" : "Match Feed"}
            </span>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-2 custom-scrollbar">
            <AnimatePresence>
              {state.commentaryFeed.length === 0 && (
                <p className="text-slate-600 text-sm italic text-center mt-20">Commentary will appear here once the match starts...</p>
              )}
              {state.commentaryFeed.map((line, i) => {
                const isGoal = line.includes("GOAL");
                const isCard = line.includes("CARD");
                const isSave = line.includes("save");
                const isShout = line.includes("SHOUT") || line.includes("Team Talk");
                const isSub = line.includes("SUBSTITUTION");
                
                return (
                  <motion.div
                    key={line + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm leading-relaxed transition-all ${
                      isGoal ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-bold'
                      : isCard ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                      : isSave ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                      : isShout || isSub ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                      : i === 0 ? 'bg-slate-800/50 border-slate-700/50 text-slate-200'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current mt-2 shrink-0 opacity-60" />
                    <span>{line}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: EVENT LOG */}
        <div className="w-80 bg-slate-900/40 backdrop-blur-xl border-l border-slate-800/50 flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-800/50 shrink-0 flex items-center gap-2">
            <Flag className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Events</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {state.events.length === 0 && (
              <p className="text-slate-600 text-xs italic text-center mt-10">No key events yet...</p>
            )}
            <AnimatePresence>
              {[...state.events].reverse().map((ev, i) => {
                const evIsHome = ev.clubId === "HOME";
                const clubColor = evIsHome ? homeClub.primaryColor : awayClub.primaryColor;
                const isGoalEvent = ev.type === "Goal";
                
                return (
                  <motion.div
                    key={`${ev.minute}-${i}`}
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={`relative flex gap-3 group ${isGoalEvent ? 'bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3' : ''}`}
                  >
                    {/* Time badge */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border ${isGoalEvent ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                        <span className={`font-black text-[10px] ${isGoalEvent ? 'text-emerald-400' : 'text-white'}`}>{ev.minute}'</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getEventIcon(ev.type)}
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full truncate"
                          style={{ backgroundColor: `${clubColor}25`, color: clubColor }}
                        >
                          {evIsHome ? homeClub.shortName : awayClub.shortName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{ev.details}</p>
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
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-slate-950 px-8 py-4 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.5)] flex items-center gap-3 font-black text-sm uppercase tracking-wider border-4 border-white max-w-[80vw] text-center"
          >
            <Megaphone className="w-5 h-5 shrink-0" />
            <span className="truncate">{teamTalkMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Modal */}
      {subModal && (
        <div className="fixed inset-0 z-[100] bg-[#05080f]/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0f1e] border border-[#1e2d40] p-6 rounded-3xl w-full max-w-2xl flex flex-col gap-4 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-slate-400" /> Make Substitution
              </h3>
              <button onClick={() => { setSubModal(false); setSubOffId(null); }} className="text-sm px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition">Close</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">1. Select Player Off</h4>
                <div className="flex flex-col gap-1.5">
                  {(isHome ? homeLineups.current.starters : awayLineups.current.starters).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSubOffId(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition ${subOffId === p.id ? 'bg-amber-500/15 border-amber-500/40' : 'bg-[#0f1623] border-[#1e2d40] hover:bg-[#1a2639]'}`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.position} · {p.overall} OVR · {Math.round(p.sharpness || 50)}% SHP</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${!subOffId && 'opacity-40 pointer-events-none'}`}>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">2. Select Player On</h4>
                <div className="flex flex-col gap-1.5">
                  {(isHome ? homeLineups.current.bench : awayLineups.current.bench).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => handleSubstitution(p.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-[#0f1623] border-[#1e2d40] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.position} · {p.overall} OVR · {Math.round(p.sharpness || 50)}% SHP</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
