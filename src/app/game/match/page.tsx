"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { MatchEvent, MatchStats } from "../../../db/storage";
import { autoSelectLineup } from "../../../engine/simulator";
import { 
  Play, FastForward, Check, ChevronRight, MessageSquare, 
  Clock, ShieldAlert, Award, ChevronLeft, Activity, Flag, Star
} from "lucide-react";

type SimState = "pre-match" | "loading" | "first-half" | "half-time" | "second-half" | "post-match";

export default function MatchViewer() {
  const router = useRouter();
  const { activeSave, updateActiveSave, advanceToNextMatchday } = useGame();
  
  const [simState, setSimState] = useState<SimState>("pre-match");
  const [matchMinute, setMatchMinute] = useState(0);
  
  // Data from API
  const [simResult, setSimResult] = useState<any>(null);
  
  // Live display feeds
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Speed
  const [speed, setSpeed] = useState<"normal" | "fast">("normal");

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const fixture = activeSave.fixtures.find(
    f => f.matchday === activeSave.currentMatchday && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)
  );

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No Match Scheduled</h2>
        <p className="text-slate-400 text-sm mb-6">There is no fixture for your club on Matchday {activeSave.currentMatchday}.</p>
        <button 
          onClick={() => advanceToNextMatchday()}
          className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold"
        >
          Advance Matchday
        </button>
      </div>
    );
  }

  const isHome = fixture.homeClubId === playerClub.id;
  const opponentClub = activeSave.clubs.find(c => c.id === (isHome ? fixture.awayClubId : fixture.homeClubId))!;
  
  const homeClub = isHome ? playerClub : opponentClub;
  const awayClub = isHome ? opponentClub : playerClub;

  const homeSquad = activeSave.players.filter(p => p.clubId === homeClub.id);
  const awaySquad = activeSave.players.filter(p => p.clubId === awayClub.id);

  const homeLineups = autoSelectLineup(homeSquad, "4-3-3");
  const awayLineups = autoSelectLineup(awaySquad, "4-3-3");

  const startSimulation = async () => {
    setSimState("loading");
    
    // We send payload to our API route
    try {
      const res = await fetch("/api/sim-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeClub,
          awayClub,
          homeSquad: homeLineups.starters,
          awaySquad: awayLineups.starters,
          homeTactics: { mentality: "Balanced", pressIntensity: "Mid", defensiveLine: "Standard", width: "Standard", tempo: "Normal", takers: { penalties: "", corners: "", freeKicks: "" } },
          awayTactics: { mentality: "Balanced", pressIntensity: "Mid", defensiveLine: "Standard", width: "Standard", tempo: "Normal", takers: { penalties: "", corners: "", freeKicks: "" } },
          homeManagerTacticsBonus: isHome ? activeSave.manager.attributes.tacticalKnowledge : 10,
          awayManagerTacticsBonus: !isHome ? activeSave.manager.attributes.tacticalKnowledge : 10
        })
      });

      if (!res.ok) throw new Error("Failed simulation");
      const data = await res.json();
      setSimResult(data);
      setSimState("first-half");
    } catch (e) {
      console.error(e);
      alert("Error running simulation.");
      setSimState("pre-match");
    }
  };

  // The Live Match Ticker Engine
  useEffect(() => {
    if (simState === "first-half" || simState === "second-half") {
      const tickRate = speed === "normal" ? 300 : 50; // ms per in-game minute
      
      timerRef.current = setInterval(() => {
        setMatchMinute(prev => {
          const nextMin = prev + 1;
          
          // Check for events in this minute
          if (simResult && simResult.events) {
            const minEvents = simResult.events.filter((e: MatchEvent) => e.minute === nextMin);
            if (minEvents.length > 0) {
              setLiveEvents(curr => [...minEvents.reverse(), ...curr]);
              
              // Update scores
              minEvents.forEach((ev: MatchEvent) => {
                if (ev.type === "Goal") {
                  if (ev.clubId === homeClub.id) setHomeScore(s => s + 1);
                  else setAwayScore(s => s + 1);
                }
              });
            }
          }

          if (nextMin === 45 && simState === "first-half") {
            clearInterval(timerRef.current!);
            setSimState("half-time");
            return 45;
          }
          if (nextMin >= 90 && simState === "second-half") {
            clearInterval(timerRef.current!);
            handleMatchEnd();
            return 90;
          }

          return nextMin;
        });
      }, tickRate);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simState, speed, simResult]);

  const handleMatchEnd = () => {
    setSimState("post-match");
    
    // Save fixture results to state
    const newState = { ...activeSave };
    const stateFixture = newState.fixtures.find(f => f.id === fixture.id)!;
    
    stateFixture.played = true;
    stateFixture.homeScore = simResult.homeScore;
    stateFixture.awayScore = simResult.awayScore;
    stateFixture.events = simResult.events;
    stateFixture.stats = simResult.stats;
    stateFixture.playerRatings = simResult.playerRatings;
    stateFixture.motmId = simResult.motmId;
    stateFixture.tacticalAnalysis = simResult.tacticalAnalysis;
    stateFixture.pressQuote = simResult.pressQuote;

    // Apply player rating boosts
    newState.players.forEach(p => {
      if (simResult.playerRatings && simResult.playerRatings[p.id]) {
        if (!p.ratingHistory) p.ratingHistory = [];
        p.ratingHistory.push(simResult.playerRatings[p.id]);
        if (p.ratingHistory.length > 5) p.ratingHistory.shift();
        
        // Goals/assists
        simResult.events?.forEach((ev: MatchEvent) => {
          if (ev.type === "Goal" && ev.playerName === p.name) {
            p.goals = (p.goals || 0) + 1;
          }
          if (ev.type === "Goal" && ev.details.includes(p.name) && ev.playerName !== p.name) {
            p.assists = (p.assists || 0) + 1;
          }
        });
      }
    });

    updateActiveSave(newState);
  };

  const skipToResult = () => {
    // fast forward all events
    if (!simResult) return;
    const allEvents = [...simResult.events].sort((a, b) => b.minute - a.minute);
    setLiveEvents(allEvents);
    setHomeScore(simResult.homeScore);
    setAwayScore(simResult.awayScore);
    setMatchMinute(90);
    handleMatchEnd();
  };

  const teamTalk = (msg: string) => {
    const newState = { ...activeSave };
    newState.gameLog.unshift(`Half-time team talk: "${msg}".`);
    updateActiveSave(newState);
    setSimState("second-half");
  };

  // Helper for rendering event icons
  const getEventIcon = (type: MatchEvent["type"]) => {
    switch(type) {
      case "Goal": return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>;
      case "Yellow Card": return <div className="w-4 h-5 rounded bg-yellow-400 mx-0.5 shadow-sm" />;
      case "Red Card": return <div className="w-4 h-5 rounded bg-red-500 mx-0.5 shadow-sm" />;
      case "Injury": return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case "Shot Saved": return <Activity className="w-5 h-5 text-blue-400" />;
      case "Big Chance Missed": return <Activity className="w-5 h-5 text-slate-500" />;
      default: return <MessageSquare className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      
      {/* Dynamic Header */}
      <div className="flex flex-col gap-6">
        <button onClick={() => router.push("/game/dashboard")} className="text-[10px] font-bold text-slate-400 hover:text-white uppercase flex items-center gap-1 w-max">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Hub
        </button>

        {/* Scoreboard */}
        <div className="glass-card p-6 md:p-8 rounded-2xl border-b-4 border-b-slate-950 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-green-500 opacity-20"></div>
          
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            Matchday {fixture.matchday} • {homeClub.league}
          </span>
          
          <div className="flex items-center justify-center gap-8 md:gap-16 w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 w-1/3">
              <div 
                className="w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 font-black text-2xl md:text-4xl"
                style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor === "#ffffff" ? "#0f172a" : homeClub.secondaryColor }}
              >
                {homeClub.name.charAt(0)}
              </div>
              <h3 className="text-sm md:text-lg font-black text-white text-center">{homeClub.name}</h3>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center justify-center gap-2 w-1/3">
              <div className="flex items-center justify-center gap-3 bg-slate-950 px-6 py-3 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-3xl md:text-5xl font-black text-white">{homeScore}</span>
                <span className="text-xl md:text-2xl font-bold text-slate-600">-</span>
                <span className="text-3xl md:text-5xl font-black text-white">{awayScore}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 font-bold text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <Clock className={`w-3.5 h-3.5 ${(simState === "first-half" || simState === "second-half") ? 'text-green-500 animate-pulse' : 'text-slate-500'}`} />
                {simState === "pre-match" ? "00:00" : simState === "post-match" ? "FT" : simState === "half-time" ? "HT" : `${matchMinute.toString().padStart(2, '0')}:00`}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 w-1/3">
              <div 
                className="w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 font-black text-2xl md:text-4xl"
                style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor === "#ffffff" ? "#0f172a" : awayClub.secondaryColor }}
              >
                {awayClub.name.charAt(0)}
              </div>
              <h3 className="text-sm md:text-lg font-black text-white text-center">{awayClub.name}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* States Layout */}
      {simState === "pre-match" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Home Lineup */}
          <div className="glass-card p-5 rounded-xl border border-slate-850">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 mb-3">
              {homeClub.name} Lineup
            </h4>
            <div className="flex flex-col divide-y divide-slate-800/50">
              {homeLineups.starters.map(p => (
                <div key={p.id} className="flex justify-between py-2 text-xs">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <div className="flex gap-3">
                    <span className="font-semibold text-slate-500 w-8">{p.position}</span>
                    <span className="font-black text-green-400 w-6 text-right">{p.overall}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Away Lineup */}
          <div className="glass-card p-5 rounded-xl border border-slate-850">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 mb-3">
              {awayClub.name} Lineup
            </h4>
            <div className="flex flex-col divide-y divide-slate-800/50">
              {awayLineups.starters.map(p => (
                <div key={p.id} className="flex justify-between py-2 text-xs">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <div className="flex gap-3">
                    <span className="font-semibold text-slate-500 w-8">{p.position}</span>
                    <span className="font-black text-rose-400 w-6 text-right">{p.overall}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              onClick={startSimulation}
              className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-green-600/20 transition flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Match
            </button>
          </div>
        </div>
      )}

      {simState === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Engine Calculating Match Variables...</h3>
            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest animate-pulse">Running Claude AI Simulation</p>
          </div>
        </div>
      )}

      {(simState === "first-half" || simState === "second-half") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Live Events Ticker */}
          <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-850 flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 shrink-0">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" /> Live Match Feed
              </h4>
              
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setSpeed("normal")}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition ${speed === "normal" ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Normal
                </button>
                <button 
                  onClick={() => setSpeed("fast")}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition ${speed === "fast" ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Fast
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {liveEvents.length === 0 ? (
                <div className="text-center text-slate-500 text-xs font-bold py-10">
                  Waiting for kickoff...
                </div>
              ) : (
                liveEvents.map((ev, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-850 rounded-lg p-4 flex gap-4 animate-fade-in">
                    <div className="w-12 shrink-0 flex flex-col items-center">
                      <span className="font-black text-green-400 text-base">{ev.minute}'</span>
                    </div>
                    <div className="flex-1 border-l border-slate-800 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        {getEventIcon(ev.type)}
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${ev.clubId === homeClub.id ? 'text-blue-400' : 'text-rose-400'}`}>
                          {ev.clubId === homeClub.id ? homeClub.shortName : awayClub.shortName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {ev.details}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats / Controls */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass-card p-5 rounded-xl border border-slate-850 flex flex-col gap-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Live Statistics</h4>
              
              <div className="flex flex-col gap-3 text-[10px] font-bold text-slate-400">
                <div className="flex justify-between border-b border-slate-850 pb-1">
                  <span>Possession</span>
                  <span>Calculating...</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-1">
                  <span>Shots</span>
                  <span>Calculating...</span>
                </div>
              </div>
            </div>

            <button
              onClick={skipToResult}
              className="mt-auto px-6 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4 text-green-500" />
              Skip to Result
            </button>
          </div>
        </div>
      )}

      {simState === "half-time" && (
        <div className="glass-card p-10 rounded-2xl border border-slate-850 text-center flex flex-col items-center gap-6 animate-fade-in">
          <h3 className="text-2xl font-black text-white">Half Time</h3>
          <p className="text-xs text-slate-400 max-w-sm">The referee blows the whistle. Deliver a quick team talk before sending them back out.</p>
          
          <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg mt-4">
            <button onClick={() => teamTalk("Praise the performance")} className="px-5 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-xs hover:bg-blue-600/20 transition">
              Praise Performance
            </button>
            <button onClick={() => teamTalk("Demand more from them")} className="px-5 py-3 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-600/20 transition">
              Demand More
            </button>
            <button onClick={() => teamTalk("Keep calm and stick to the plan")} className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 transition">
              Stay Calm
            </button>
          </div>
        </div>
      )}

      {simState === "post-match" && simResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Match Analysis & Quotes */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-card p-6 rounded-xl border border-slate-850 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 border-b border-slate-850 pb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Tactical Analysis
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {simResult.tacticalAnalysis}
              </p>
              
              <div className="mt-4 p-4 bg-slate-950/60 rounded-lg border-l-4 border-green-500">
                <p className="text-xs italic text-slate-400">
                  {simResult.pressQuote}
                </p>
              </div>
            </div>

            {/* Match Stats */}
            <div className="glass-card p-6 rounded-xl border border-slate-850">
               <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 mb-4 flex justify-between">
                <span>{homeClub.shortName}</span>
                <span>Match Stats</span>
                <span>{awayClub.shortName}</span>
              </h4>

              <div className="flex flex-col gap-5 text-xs font-bold text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="w-10 text-center">{simResult.stats?.possession?.home || 50}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Possession</span>
                  <span className="w-10 text-center">{simResult.stats?.possession?.away || 50}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-10 text-center">{simResult.stats?.shots?.home || 0}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Shots</span>
                  <span className="w-10 text-center">{simResult.stats?.shots?.away || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-10 text-center">{simResult.stats?.shotsOnTarget?.home || 0}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">On Target</span>
                  <span className="w-10 text-center">{simResult.stats?.shotsOnTarget?.away || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-10 text-center">{simResult.stats?.fouls?.home || 0}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Fouls</span>
                  <span className="w-10 text-center">{simResult.stats?.fouls?.away || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Ratings */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass-card p-5 rounded-xl border border-slate-850 flex flex-col h-full max-h-[500px] overflow-y-auto">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 mb-3 sticky top-0 bg-[#1e293b]/90 backdrop-blur">
                Player Ratings
              </h4>
              
              <div className="flex flex-col gap-2">
                {[...homeLineups.starters, ...awayLineups.starters].map(p => {
                  const rating = simResult.playerRatings ? simResult.playerRatings[p.id] : 6.0;
                  const isMotm = p.id === simResult.motmId;

                  return (
                    <div key={p.id} className={`flex justify-between items-center p-2 rounded-lg border ${isMotm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-950/40 border-slate-900'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-200">{p.name}</span>
                        {isMotm && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                      </div>
                      <span className={`text-xs font-black ${rating >= 8.0 ? 'text-green-400' : rating >= 6.0 ? 'text-slate-300' : 'text-rose-400'}`}>
                        {rating ? rating.toFixed(1) : "6.0"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                advanceToNextMatchday();
                router.push("/game/dashboard");
              }}
              className="mt-auto px-6 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-green-600/20 transition flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
