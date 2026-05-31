"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Shield, Sliders, Play, Save, ChevronDown, CheckCircle, RefreshCw 
} from "lucide-react";
import { autoSelectLineup, TacticalInstructions, DEFAULT_TACTICS } from "../../../engine/simulator";
import { Player } from "../../../config/seededData";

export default function Tactics() {
  const { activeSave, updateActiveSave } = useGame();
  
  const [formation, setFormation] = useState("4-3-3");
  const [activeSlot, setActiveSlot] = useState(1);
  const [tactics, setTactics] = useState<TacticalInstructions>(DEFAULT_TACTICS);
  const [starters, setStarters] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  


  const [notif, setNotif] = useState("");

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id);

  const [initialized, setInitialized] = useState(false);

  // Set initial squad lineup
  useEffect(() => {
    if (!activeSave) return;
    
    if (!initialized) {
      if (activeSave.tactics) {
        setFormation(activeSave.tactics.formation);
        setTactics(activeSave.tactics.instructions);
        
        const savedStarters = activeSave.tactics.starters.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
        const savedBench = activeSave.tactics.bench.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
        
        if (savedStarters.length === 11) {
          setStarters(savedStarters);
          setBench(savedBench);
          setInitialized(true);
          return;
        }
      }
      
      const { starters: autoS, bench: autoB } = autoSelectLineup(squad, formation);
      setStarters(autoS);
      setBench(autoB);
      setInitialized(true);
    }
  }, [activeSave, initialized]);

  const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormation = e.target.value;
    setFormation(newFormation);
    const { starters: autoS, bench: autoB } = autoSelectLineup(squad, newFormation);
    setStarters(autoS);
    setBench(autoB);
  };

  // Provide default presets if save has none
  const defaultPresets = {
    1: { formation: "4-3-3", tactics: DEFAULT_TACTICS },
    2: { formation: "4-4-2", tactics: { ...DEFAULT_TACTICS, mentality: "Defensive" } },
    3: { formation: "4-2-3-1", tactics: { ...DEFAULT_TACTICS, mentality: "Attacking" } }
  };
  const currentPresets = activeSave.tacticalPresets || defaultPresets;

  // Load preset slot
  const handleLoadSlot = (slotNum: number) => {
    setActiveSlot(slotNum);
    const preset = currentPresets[slotNum as keyof typeof currentPresets];
    if (preset) {
      setFormation(preset.formation);
      setTactics(preset.tactics);
      triggerNotification(`Loaded Tactical Preset ${slotNum}`);
    }
  };

  // Save preset slot
  const handleSaveSlot = () => {
    const updatedPresets = {
      ...currentPresets,
      [activeSlot]: { formation, tactics }
    };
    
    // Save tactics back to current save file
    updateActiveSave({
      ...activeSave,
      tacticalPresets: updatedPresets,
      tactics: {
        formation,
        instructions: tactics,
        starters: starters.map(p => p.id),
        bench: bench.map(p => p.id)
      },
      gameLog: [`Tactical setup updated and saved.`, ...activeSave.gameLog]
    });
    
    triggerNotification(`Saved to Preset Slot ${activeSlot} and applied to Active Setup!`);
  };

  const triggerNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleSwapPlayers = (starterId: string, benchId: string) => {
    const activeStarter = starters.find(p => p.id === starterId)!;
    const activeBench = bench.find(p => p.id === benchId)!;

    const newStarters = starters.map(p => p.id === starterId ? activeBench : p);
    const newBench = bench.map(p => p.id === benchId ? activeStarter : p);

    setStarters(newStarters);
    setBench(newBench);
    triggerNotification(`Swapped ${activeStarter.name} with ${activeBench.name}`);
  };

  // Calculate coordinates for players on pitch based on formation
  // In 100x100 grid: GK at bottom (50, 85). Defs, Mids, Atts at various layers
  const getPitchPositions = () => {
    const positions: { label: string; x: number; y: number; role: "GK" | "DEF" | "MID" | "ATT" }[] = [];
    
    // Always 1 GK
    positions.push({ label: "GK", x: 50, y: 85, role: "GK" });

    // Parse Defense, Midfield, Attack counts
    let defCount = 4;
    let midCount = 3;
    let attCount = 3;

    if (formation === "4-4-2") { defCount = 4; midCount = 4; attCount = 2; }
    else if (formation === "4-2-3-1") { defCount = 4; midCount = 5; attCount = 1; }
    else if (formation === "3-5-2") { defCount = 3; midCount = 5; attCount = 2; }
    else if (formation === "5-3-2") { defCount = 5; midCount = 3; attCount = 2; }
    else if (formation === "4-5-1") { defCount = 4; midCount = 5; attCount = 1; }
    else if (formation === "3-4-3") { defCount = 3; midCount = 4; attCount = 3; }
    else if (formation === "4-1-4-1") { defCount = 4; midCount = 5; attCount = 1; }

    // Defense coordinates
    const defY = 65;
    if (defCount === 3) {
      positions.push({ label: "CB", x: 25, y: defY, role: "DEF" });
      positions.push({ label: "CB", x: 50, y: defY, role: "DEF" });
      positions.push({ label: "CB", x: 75, y: defY, role: "DEF" });
    } else if (defCount === 4) {
      positions.push({ label: "LB", x: 15, y: defY - 5, role: "DEF" });
      positions.push({ label: "CB", x: 38, y: defY, role: "DEF" });
      positions.push({ label: "CB", x: 62, y: defY, role: "DEF" });
      positions.push({ label: "RB", x: 85, y: defY - 5, role: "DEF" });
    } else if (defCount === 5) {
      positions.push({ label: "LWB", x: 12, y: defY - 8, role: "DEF" });
      positions.push({ label: "CB", x: 32, y: defY, role: "DEF" });
      positions.push({ label: "CB", x: 50, y: defY, role: "DEF" });
      positions.push({ label: "CB", x: 68, y: defY, role: "DEF" });
      positions.push({ label: "RWB", x: 88, y: defY - 8, role: "DEF" });
    }

    // Midfield coordinates
    const midY = 40;
    if (midCount === 3) {
      positions.push({ label: "CM", x: 30, y: midY, role: "MID" });
      positions.push({ label: "CM", x: 50, y: midY + 5, role: "MID" });
      positions.push({ label: "CM", x: 70, y: midY, role: "MID" });
    } else if (midCount === 4) {
      positions.push({ label: "LM", x: 15, y: midY - 2, role: "MID" });
      positions.push({ label: "CM", x: 38, y: midY + 4, role: "MID" });
      positions.push({ label: "CM", x: 62, y: midY + 4, role: "MID" });
      positions.push({ label: "RM", x: 85, y: midY - 2, role: "MID" });
    } else if (midCount === 5) {
      positions.push({ label: "LM", x: 15, y: midY - 5, role: "MID" });
      positions.push({ label: "DM", x: 50, y: midY + 12, role: "MID" });
      positions.push({ label: "CM", x: 35, y: midY + 2, role: "MID" });
      positions.push({ label: "CM", x: 65, y: midY + 2, role: "MID" });
      positions.push({ label: "RM", x: 85, y: midY - 5, role: "MID" });
    }

    // Attack coordinates
    const attY = 18;
    if (attCount === 1) {
      positions.push({ label: "ST", x: 50, y: attY, role: "ATT" });
    } else if (attCount === 2) {
      positions.push({ label: "ST", x: 35, y: attY, role: "ATT" });
      positions.push({ label: "ST", x: 65, y: attY, role: "ATT" });
    } else if (attCount === 3) {
      positions.push({ label: "LW", x: 20, y: attY + 4, role: "ATT" });
      positions.push({ label: "ST", x: 50, y: attY, role: "ATT" });
      positions.push({ label: "RW", x: 80, y: attY + 4, role: "ATT" });
    }

    return positions;
  };

  const pitchSpots = getPitchPositions();

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Tactics Board
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Draw formations, adjust mentality sliders, and choose your starting lineup.
          </p>
        </div>

        {/* Saved preset controls */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(slot => (
            <button
              key={slot}
              onClick={() => handleLoadSlot(slot)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${activeSlot === slot ? 'bg-green-600 text-white shadow shadow-green-600/10' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              Preset {slot}
            </button>
          ))}
          
          <button
            onClick={handleSaveSlot}
            className="px-3.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1 shadow transition active:scale-95 ml-2"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notif && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          {notif}
        </div>
      )}

      {/* Main Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Soccer Pitch visual (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Formation picker */}
          <div className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400">Tactical Formation:</span>
            <select
              value={formation}
              onChange={handleFormationChange}
              className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-green-500"
            >
              {["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-5-1", "3-4-3", "4-1-4-1"].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Visual Soccer Pitch representation */}
          <div className="w-full aspect-[4/5] max-w-[480px] mx-auto bg-emerald-950 border-4 border-emerald-800 rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center p-4">
            
            {/* Center Circle */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-800/40 pointer-events-none" />
            {/* Half line */}
            <div className="absolute w-full h-0.5 bg-emerald-800/40 top-1/2 pointer-events-none" />
            {/* Penalty areas */}
            <div className="absolute w-[60%] h-[15%] border-b-2 border-x-2 border-emerald-800/40 top-0 pointer-events-none" />
            <div className="absolute w-[60%] h-[15%] border-t-2 border-x-2 border-emerald-800/40 bottom-0 pointer-events-none" />

            {/* Position nodes */}
            {pitchSpots.map((spot, idx) => {
              // Match player from starters list that fits role
              const listInRole = starters.filter(p => p.position === spot.role);
              const alreadyAssigned = pitchSpots.slice(0, idx).filter(s => s.role === spot.role).length;
              const player = listInRole[alreadyAssigned] || starters[idx];

              if (!player) return null;

              return (
                <div
                  key={idx}
                  className="absolute flex flex-col items-center gap-1 cursor-pointer transition select-none group"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Circle Player badge */}
                  <div 
                    className="w-10 h-10 rounded-full bg-slate-900 border-2 border-green-500 flex items-center justify-center font-bold text-xs text-white shadow-lg group-hover:bg-slate-800 group-hover:scale-105 transition"
                    title="Click to substitute"
                  >
                    {player.overall}
                  </div>
                  {/* Label */}
                  <span className="text-[9px] font-black uppercase text-white bg-slate-950/80 px-1 py-0.5 rounded leading-none text-center max-w-[70px] truncate">
                    {player.name.split(" ").pop()}
                  </span>
                  <span className="text-[7px] font-bold text-green-400 bg-slate-950/60 px-1 rounded-sm leading-none -mt-0.5">
                    {spot.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Team settings panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Mentality & Tactical slider card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-green-500" />
              Team Instructions
            </h3>

            {/* Mentality selector */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Attacking Mentality:</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Defensive", "Balanced", "Attacking"] as const).map(ment => (
                  <button
                    key={ment}
                    onClick={() => setTactics({ ...tactics, mentality: ment })}
                    className={`py-2 rounded font-bold transition text-[10px] ${tactics.mentality === ment ? 'bg-green-600 text-white font-bold' : 'bg-slate-950 border border-slate-850 text-slate-400'}`}
                  >
                    {ment}
                  </button>
                ))}
              </div>
            </div>

            {/* Pressing slider */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Press Intensity:</label>
              <div className="grid grid-cols-4 gap-1">
                {(["None", "Low", "Mid", "High"] as const).map(press => (
                  <button
                    key={press}
                    onClick={() => setTactics({ ...tactics, pressIntensity: press })}
                    className={`py-2 rounded font-bold transition text-[10px] ${tactics.pressIntensity === press ? 'bg-green-600 text-white font-bold' : 'bg-slate-950 border border-slate-850 text-slate-400'}`}
                  >
                    {press}
                  </button>
                ))}
              </div>
            </div>

            {/* Defensive Line */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Defensive Line:</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Deep", "Standard", "High"] as const).map(line => (
                  <button
                    key={line}
                    onClick={() => setTactics({ ...tactics, defensiveLine: line })}
                    className={`py-2 rounded font-bold transition text-[10px] ${tactics.defensiveLine === line ? 'bg-green-600 text-white font-bold' : 'bg-slate-950 border border-slate-850 text-slate-400'}`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Tempo Speed:</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Slow", "Normal", "Fast"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTactics({ ...tactics, tempo: t })}
                    className={`py-2 rounded font-bold transition text-[10px] ${tactics.tempo === t ? 'bg-green-600 text-white font-bold' : 'bg-slate-950 border border-slate-850 text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Set piece takers selection */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 shadow-lg text-xs">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5">Set-Piece Takers</h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Penalties</label>
                <select
                  value={tactics.takers.penalties}
                  onChange={(e) => setTactics({ ...tactics, takers: { ...tactics.takers, penalties: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[11px] text-white"
                >
                  <option value="">Auto-Assign (Highest Shooting)</option>
                  {starters.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position} - Ovr {p.overall})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Corners</label>
                <select
                  value={tactics.takers.corners}
                  onChange={(e) => setTactics({ ...tactics, takers: { ...tactics.takers, corners: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[11px] text-white"
                >
                  <option value="">Auto-Assign (Highest Passing)</option>
                  {starters.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position} - Ovr {p.overall})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Reserves substitution swap list */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 shadow-lg text-xs">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5">Substitute / Squad Bench</h3>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {bench.slice(0, 7).map(benchPlayer => (
                <div key={benchPlayer.id} className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-850">
                  <div>
                    <span className="font-bold text-slate-200">{benchPlayer.name}</span>
                    <span className="text-[9px] text-slate-500 ml-2">({benchPlayer.position} - Ovr {benchPlayer.overall})</span>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSwapPlayers(e.target.value, benchPlayer.id);
                    }}
                    className="bg-slate-950 text-[10px] border border-slate-850 px-2 py-0.5 rounded text-slate-400"
                    defaultValue=""
                  >
                    <option value="" disabled>Swap with...</option>
                    {starters.map(star => (
                      <option key={star.id} value={star.id}>{star.name} ({star.position})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
