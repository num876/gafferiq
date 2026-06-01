/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { ChevronLeft, Trophy, Users, Sliders } from "lucide-react";
import { CLUBS_DATA, generateSquadForClub, Player, Club } from "../../../config/seededData";
import { DndContext, DragEndEvent, DragStartEvent, pointerWithin } from "@dnd-kit/core";
import { TacticsPitch, FORMATION_433 } from "../../../components/tactics/TacticsPitch";
import { BenchArea } from "../../../components/tactics/BenchArea";

export default function SquadReview() {
  const router = useRouter();
  const { createNewGame } = useGame();

  const [manager, setManager] = useState<any>(null);
  const [clubId, setClubId] = useState<string>("");
  const [club, setClub] = useState<Club | null>(null);

  const [startingXI, setStartingXI] = useState<Record<string, Player | null>>({});
  const [bench, setBench] = useState<Player[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Save Settings
  const [saveName, setSaveName] = useState("");
  const [gameSpeed, setGameSpeed] = useState<"Quick Sim" | "Detailed Sim">("Detailed Sim");

  useEffect(() => {
    const rawManager = sessionStorage.getItem("gaffer_iq_onboarding_manager");
    const rawClubId = sessionStorage.getItem("gaffer_iq_onboarding_club_id");

    if (!rawManager || !rawClubId) {
      router.push("/onboarding/manager");
      return;
    }

    const parsedManager = JSON.parse(rawManager);
    const parsedClub = CLUBS_DATA.find(c => c.id === rawClubId)!;

    setManager(parsedManager);
    setClubId(rawClubId);
    setClub(parsedClub);
    setSaveName(`${parsedManager.lastName} - ${parsedClub.shortName}`);
    
    // Generate preview squad
    const generated = generateSquadForClub(rawClubId, parsedClub.reputation);
    
    // Auto-assign to slots (best overall first)
    const sortedSquad = [...generated].sort((a, b) => b.overall - a.overall);
    const availablePlayers = [...sortedSquad];
    const newStartingXI: Record<string, Player | null> = {};
    
    FORMATION_433.forEach(slot => {
      let expectedPos = 'MID';
      if (slot.id.includes('GK')) expectedPos = 'GK';
      if (slot.id.includes('B')) expectedPos = 'DEF';
      if (slot.id.includes('W') || slot.id.includes('ST')) expectedPos = 'ATT';
      
      const matchIdx = availablePlayers.findIndex(p => p.position === expectedPos);
      if (matchIdx !== -1) {
        newStartingXI[slot.id] = availablePlayers[matchIdx];
        availablePlayers.splice(matchIdx, 1);
      } else {
        newStartingXI[slot.id] = availablePlayers[0];
        availablePlayers.splice(0, 1);
      }
    });

    setStartingXI(newStartingXI);
    setBench(availablePlayers);
  }, [router]);

  if (!manager || !club) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">
        <div className="animate-pulse font-medium text-slate-400">Loading squad details...</div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    
    const draggedPlayerId = active.id as string;
    const overId = over.id as string;

    // Find source
    let sourceSlotId: string | null = null;
    for (const [slot, player] of Object.entries(startingXI)) {
      if (player && player.id === draggedPlayerId) {
        sourceSlotId = slot;
        break;
      }
    }
    const isFromBench = sourceSlotId === null;
    const draggedPlayer = isFromBench ? bench.find(p => p.id === draggedPlayerId) : startingXI[sourceSlotId!];
    
    if (!draggedPlayer) return;

    // Case 1: Drag to bench
    if (overId === 'bench') {
      if (isFromBench) return; // already on bench
      setStartingXI(prev => ({ ...prev, [sourceSlotId!]: null }));
      setBench(prev => [...prev, draggedPlayer].sort((a,b) => b.overall - a.overall));
      return;
    }
    
    // Case 2: Drag to a pitch slot
    const targetPlayer = startingXI[overId];
    
    if (isFromBench) {
      setStartingXI(prev => ({ ...prev, [overId]: draggedPlayer }));
      setBench(prev => {
        const newBench = prev.filter(p => p.id !== draggedPlayerId);
        if (targetPlayer) newBench.push(targetPlayer);
        return newBench.sort((a,b) => b.overall - a.overall);
      });
    } else {
      setStartingXI(prev => ({
        ...prev,
        [overId]: draggedPlayer,
        [sourceSlotId!]: targetPlayer
      }));
    }
  };

  const handleLaunch = () => {
    if (!saveName.trim()) return;
    createNewGame(saveName, manager, clubId, gameSpeed);
    router.push("/game/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between py-12 px-6 lg:px-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          GAFFER<span className="text-green-500">IQ</span>
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Step 1: Manager</span>
          <span>→</span>
          <span>Step 2: Club</span>
          <span>→</span>
          <span className="text-green-400 font-bold">Step 3: Tactics</span>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          
          {/* Left: Interactive Tactics Pitch */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Starting XI (4-3-3)
            </h2>
            <TacticsPitch startingXI={startingXI} />
          </div>

          {/* Right: Bench & Settings */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            
            {/* Substitutes / Bench */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300">Substitutes & Reserves</h3>
                <span className="text-[10px] font-semibold bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Drag to swap
                </span>
              </div>
              <BenchArea bench={bench} />
            </div>

            {/* Campaign Settings */}
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 shadow-xl mt-4">
              <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-green-500" />
                Campaign Settings
              </h2>

              {/* Save Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Save Name</label>
                <input 
                  type="text" 
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Name your career save"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white font-bold"
                />
              </div>

              {/* Game Speed */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Sim Speed / Details</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: "Quick Sim" as const, desc: "Matches instantly simulated client-side." },
                    { mode: "Detailed Sim" as const, desc: "Interactive match viewer with live commentary." }
                  ].map(item => (
                    <button
                      key={item.mode}
                      onClick={() => setGameSpeed(item.mode)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${gameSpeed === item.mode ? 'bg-green-600/10 border-green-500 text-green-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      <span className="font-bold text-xs">{item.mode}</span>
                      <span className="text-[9px] text-slate-500 mt-1 leading-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Actions */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => router.push("/onboarding/club")}
                  className="flex-1 py-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-xs tracking-wider uppercase text-slate-400 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={!saveName.trim()}
                  className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:pointer-events-none font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-1.5 shadow shadow-green-600/10 active:scale-95 transition"
                >
                  <Trophy className="w-4 h-4" /> Launch Game
                </button>
              </div>
            </div>

          </div>
        </div>
      </DndContext>
    </div>
  );
}
