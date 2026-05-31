"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Shield, Sliders, Save, CheckCircle, GripHorizontal, ChevronDown, User, Activity, AlertCircle
} from "lucide-react";
import { autoSelectLineup, TacticalInstructions, DEFAULT_TACTICS } from "../../../engine/simulator";
import { Player } from "../../../config/seededData";
import { motion, AnimatePresence } from "framer-motion";

export default function Tactics() {
  const { activeSave, updateActiveSave } = useGame();
  
  const [formation, setFormation] = useState("4-3-3");
  const [tactics, setTactics] = useState<TacticalInstructions>(DEFAULT_TACTICS);
  const [starters, setStarters] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  const [notif, setNotif] = useState("");
  
  // Interactive Popover State
  const [selectedNode, setSelectedNode] = useState<{ index: number, player: Player, spot: any } | null>(null);

  const [initialized, setInitialized] = useState(false);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id);

  // Initialization
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

  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation);
    setSelectedNode(null);
    // Keep same starters, they will animate to new slots
  };

  const handleSaveSlot = () => {
    updateActiveSave({
      ...activeSave,
      tactics: {
        formation,
        instructions: tactics,
        starters: starters.map(p => p.id),
        bench: bench.map(p => p.id)
      },
      gameLog: [`Tactical setup updated and saved.`, ...activeSave.gameLog]
    });
    
    setNotif("Tactical Setup Saved Successfully!");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleSwapPlayers = (starterIdx: number, benchId: string) => {
    const activeStarter = starters[starterIdx];
    const activeBench = bench.find(p => p.id === benchId)!;

    const newStarters = [...starters];
    newStarters[starterIdx] = activeBench;
    
    const newBench = bench.map(p => p.id === benchId ? activeStarter : p);

    setStarters(newStarters);
    setBench(newBench);
    setNotif(`Swapped ${activeStarter.name} with ${activeBench.name}`);
    setTimeout(() => setNotif(""), 3000);
    setSelectedNode(null);
  };

  // Helper: Pitch Positions (Percentage based, attacking upwards)
  const getPitchPositions = () => {
    const positions: { label: string; x: number; y: number; role: "GK" | "DEF" | "MID" | "ATT"; roleOptions: string[] }[] = [];
    
    // Always 1 GK
    positions.push({ label: "GK", x: 50, y: 90, role: "GK", roleOptions: ["Sweeper Keeper", "Goalkeeper"] });

    let defCount = 4; let midCount = 3; let attCount = 3;
    if (formation === "4-4-2") { defCount = 4; midCount = 4; attCount = 2; }
    else if (formation === "4-2-3-1") { defCount = 4; midCount = 5; attCount = 1; }
    else if (formation === "3-5-2") { defCount = 3; midCount = 5; attCount = 2; }
    else if (formation === "5-3-2") { defCount = 5; midCount = 3; attCount = 2; }
    else if (formation === "4-5-1") { defCount = 4; midCount = 5; attCount = 1; }
    else if (formation === "3-4-3") { defCount = 3; midCount = 4; attCount = 3; }

    const defRoles = ["Ball-Playing Defender", "Central Defender", "No-Nonsense CB"];
    const wideDefRoles = ["Wing-Back", "Full-Back", "Inverted Wing-Back"];

    // Defense coordinates
    const defY = 72;
    if (defCount === 3) {
      positions.push({ label: "CB", x: 25, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "CB", x: 50, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "CB", x: 75, y: defY, role: "DEF", roleOptions: defRoles });
    } else if (defCount === 4) {
      positions.push({ label: "LB", x: 15, y: defY - 8, role: "DEF", roleOptions: wideDefRoles });
      positions.push({ label: "CB", x: 35, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "CB", x: 65, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "RB", x: 85, y: defY - 8, role: "DEF", roleOptions: wideDefRoles });
    } else if (defCount === 5) {
      positions.push({ label: "LWB", x: 12, y: defY - 15, role: "DEF", roleOptions: wideDefRoles });
      positions.push({ label: "CB", x: 30, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "CB", x: 50, y: defY + 3, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "CB", x: 70, y: defY, role: "DEF", roleOptions: defRoles });
      positions.push({ label: "RWB", x: 88, y: defY - 15, role: "DEF", roleOptions: wideDefRoles });
    }

    const midRoles = ["Box-to-Box", "Deep-Lying Playmaker", "Advanced Playmaker", "Ball-Winning Mid"];
    const wideMidRoles = ["Winger", "Inverted Winger", "Wide Midfielder"];

    // Midfield coordinates
    const midY = 48;
    if (midCount === 3) {
      positions.push({ label: "CM", x: 30, y: midY, role: "MID", roleOptions: midRoles });
      positions.push({ label: "CM", x: 50, y: midY + 8, role: "MID", roleOptions: midRoles });
      positions.push({ label: "CM", x: 70, y: midY, role: "MID", roleOptions: midRoles });
    } else if (midCount === 4) {
      positions.push({ label: "LM", x: 15, y: midY - 6, role: "MID", roleOptions: wideMidRoles });
      positions.push({ label: "CM", x: 38, y: midY + 5, role: "MID", roleOptions: midRoles });
      positions.push({ label: "CM", x: 62, y: midY + 5, role: "MID", roleOptions: midRoles });
      positions.push({ label: "RM", x: 85, y: midY - 6, role: "MID", roleOptions: wideMidRoles });
    } else if (midCount === 5) {
      positions.push({ label: "LM", x: 15, y: midY - 5, role: "MID", roleOptions: wideMidRoles });
      positions.push({ label: "CDM", x: 50, y: midY + 12, role: "MID", roleOptions: ["Anchor Man", "Regista"] });
      positions.push({ label: "CM", x: 35, y: midY - 2, role: "MID", roleOptions: midRoles });
      positions.push({ label: "CM", x: 65, y: midY - 2, role: "MID", roleOptions: midRoles });
      positions.push({ label: "RM", x: 85, y: midY - 5, role: "MID", roleOptions: wideMidRoles });
    }

    const attRoles = ["Advanced Forward", "Target Man", "False 9", "Poacher"];
    const wideAttRoles = ["Inside Forward", "Winger", "Raumdeuter"];

    // Attack coordinates
    const attY = 20;
    if (attCount === 1) {
      positions.push({ label: "ST", x: 50, y: attY, role: "ATT", roleOptions: attRoles });
    } else if (attCount === 2) {
      positions.push({ label: "ST", x: 35, y: attY, role: "ATT", roleOptions: attRoles });
      positions.push({ label: "ST", x: 65, y: attY, role: "ATT", roleOptions: attRoles });
    } else if (attCount === 3) {
      positions.push({ label: "LW", x: 20, y: attY + 8, role: "ATT", roleOptions: wideAttRoles });
      positions.push({ label: "ST", x: 50, y: attY, role: "ATT", roleOptions: attRoles });
      positions.push({ label: "RW", x: 80, y: attY + 8, role: "ATT", roleOptions: wideAttRoles });
    }

    return positions;
  };

  const pitchSpots = getPitchPositions();

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e2d40] pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#22c55e]" /> Tactics Board
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Design your masterclass. Drag to position, click to assign roles.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {notif && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="px-4 py-2 rounded-full bg-[#16a34a]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> {notif}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSaveSlot}
            className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-transform active:scale-95 uppercase tracking-wider"
          >
            <Save className="w-4 h-4" /> Save Tactics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* =======================================
            LEFT COLUMN: THE PITCH (7 cols)
            ======================================= */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          
          {/* Formation Tabs */}
          <div className="glass-card p-2 rounded-2xl flex items-center overflow-x-auto border-[#1e2d40] shadow-md scrollbar-hide">
            {["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-5-1"].map(f => (
              <button
                key={f}
                onClick={() => handleFormationChange(f)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex-shrink-0 ${formation === f ? 'bg-[#22c55e] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#1e2d40]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* SVG Pitch Canvas */}
          <div className="relative w-full max-w-[500px] mx-auto aspect-[4/5] bg-[#166534] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#0f4b23] select-none">
            
            {/* SVG Pitch Lines */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-0 opacity-40">
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.5" />
              {/* Halfway Line */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
              {/* Center Circle & Spot */}
              <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="0.5" fill="white" />
              {/* Penalty Areas */}
              <rect x="20" y="0" width="60" height="15" fill="none" stroke="white" strokeWidth="0.5" />
              <rect x="20" y="85" width="60" height="15" fill="none" stroke="white" strokeWidth="0.5" />
              {/* Goal Areas */}
              <rect x="35" y="0" width="30" height="5" fill="none" stroke="white" strokeWidth="0.5" />
              <rect x="35" y="95" width="30" height="5" fill="none" stroke="white" strokeWidth="0.5" />
              {/* Penalty Spots */}
              <circle cx="50" cy="10" r="0.5" fill="white" />
              <circle cx="50" cy="90" r="0.5" fill="white" />
              {/* Corner Arcs */}
              <path d="M 0 5 A 5 5 0 0 0 5 0" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M 95 0 A 5 5 0 0 0 100 5" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M 0 95 A 5 5 0 0 1 5 100" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M 95 100 A 5 5 0 0 1 100 95" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>

            {/* Formation Watermark */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-20">
              <span className="text-8xl font-black text-white mix-blend-overlay rotate-[-10deg]">{formation}</span>
            </div>

            {/* Draggable Player Nodes */}
            <div className="absolute inset-0 z-10 p-4">
              {pitchSpots.map((spot, idx) => {
                const player = starters[idx];
                if (!player) return null;

                const isSelected = selectedNode?.index === idx;

                return (
                  <motion.div
                    key={player.id}
                    layoutId={`player-${player.id}`}
                    initial={false}
                    animate={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    drag
                    dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
                    dragSnapToOrigin={true}
                    dragElastic={0.2}
                    onClick={() => setSelectedNode(isSelected ? null : { index: idx, player, spot })}
                    className="absolute w-12 h-12 flex flex-col items-center justify-center -ml-6 -mt-6 cursor-grab active:cursor-grabbing group z-20"
                  >
                    {/* Position Label Above */}
                    <div className="absolute -top-3 px-1.5 py-0.5 rounded bg-[#080c14] border border-[#1e2d40] text-[8px] font-black text-[#22c55e] z-30 shadow-lg">
                      {spot.label}
                    </div>

                    {/* Node Circle */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-white text-xs shadow-xl transition-all ${isSelected ? 'bg-[#22c55e] border-white scale-110 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-[#0f1623] border-[#22c55e] group-hover:border-white'}`}>
                      {player.overall}
                    </div>

                    {/* Name Label Below */}
                    <div className="absolute -bottom-5 px-2 py-0.5 rounded bg-[#0f1623]/90 backdrop-blur-sm border border-[#1e2d40] text-[9px] font-bold text-white whitespace-nowrap z-30 max-w-[80px] truncate shadow-lg">
                      {player.name.split(" ").pop()}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Click Popover */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-50 p-4 rounded-2xl bg-[#0a0f1e]/95 backdrop-blur-xl border border-[#1e2d40] shadow-2xl w-64"
                  style={{
                    left: `${selectedNode.spot.x > 50 ? selectedNode.spot.x - 30 : selectedNode.spot.x + 5}%`,
                    top: `${selectedNode.spot.y > 50 ? selectedNode.spot.y - 30 : selectedNode.spot.y + 5}%`,
                  }}
                >
                  <div className="flex justify-between items-start border-b border-[#1e2d40] pb-3 mb-3">
                    <div>
                      <h4 className="font-black text-white text-sm leading-tight">{selectedNode.player.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedNode.player.position} • {selectedNode.player.age} YRS</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#22c55e] flex items-center justify-center text-xs font-black text-white bg-[#0f1623]">
                      {selectedNode.player.overall}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Form Dots */}
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Current Form</span>
                      <div className="flex items-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < 3 ? 'bg-[#22c55e]' : i < 4 ? 'bg-[#f59e0b]' : 'bg-rose-500'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Role Selector */}
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Tactical Role</span>
                      <div className="relative">
                        <select className="w-full appearance-none bg-[#0f1623] border border-[#1e2d40] text-white text-xs font-bold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#22c55e]">
                          {selectedNode.spot.roleOptions.map((role: string) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Substitute Action */}
                    <div className="pt-2 border-t border-[#1e2d40]">
                      <span className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Substitute</span>
                      <div className="relative">
                        <select 
                          onChange={(e) => {
                            if(e.target.value) handleSwapPlayers(selectedNode.index, e.target.value);
                          }}
                          className="w-full appearance-none bg-[#1e2d40] text-slate-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none"
                          value=""
                        >
                          <option value="" disabled>Swap with bench...</option>
                          {bench.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.position} - {b.overall})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* =======================================
            RIGHT COLUMN: INSTRUCTIONS (5 cols)
            ======================================= */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-6 border-[#1e2d40] shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest border-b border-[#1e2d40] pb-4">
              <Sliders className="w-5 h-5 text-[#f59e0b]" /> Team Instructions
            </h3>

            {/* Mentality */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Attacking Mentality</label>
                <span className="text-[11px] font-black text-[#22c55e]">{tactics.mentality}</span>
              </div>
              <div className="flex bg-[#0a0f1e] rounded-xl p-1 border border-[#1e2d40]">
                {(["Defensive", "Balanced", "Attacking"] as const).map(ment => (
                  <button
                    key={ment}
                    onClick={() => setTactics({ ...tactics, mentality: ment })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tactics.mentality === ment ? 'bg-[#22c55e] text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-[#1e2d40]'}`}
                  >
                    {ment}
                  </button>
                ))}
              </div>
            </div>

            {/* Press Intensity */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Press Intensity</label>
                <span className="text-[11px] font-black text-[#f59e0b]">{tactics.pressIntensity}</span>
              </div>
              <div className="flex bg-[#0a0f1e] rounded-xl p-1 border border-[#1e2d40]">
                {(["None", "Low", "Mid", "High"] as const).map(press => (
                  <button
                    key={press}
                    onClick={() => setTactics({ ...tactics, pressIntensity: press })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tactics.pressIntensity === press ? 'bg-[#f59e0b] text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-[#1e2d40]'}`}
                  >
                    {press}
                  </button>
                ))}
              </div>
            </div>

            {/* Defensive Line */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Defensive Line</label>
                <span className="text-[11px] font-black text-sky-400">{tactics.defensiveLine}</span>
              </div>
              <div className="flex bg-[#0a0f1e] rounded-xl p-1 border border-[#1e2d40]">
                {(["Deep", "Standard", "High"] as const).map(line => (
                  <button
                    key={line}
                    onClick={() => setTactics({ ...tactics, defensiveLine: line })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tactics.defensiveLine === line ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-[#1e2d40]'}`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo Speed */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tempo Speed</label>
                <span className="text-[11px] font-black text-rose-400">{tactics.tempo}</span>
              </div>
              <div className="flex bg-[#0a0f1e] rounded-xl p-1 border border-[#1e2d40]">
                {(["Slow", "Normal", "Fast"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTactics({ ...tactics, tempo: t })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tactics.tempo === t ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-[#1e2d40]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Set Piece Takers */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-[#1e2d40] shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest border-b border-[#1e2d40] pb-4">
              <User className="w-5 h-5 text-purple-500" /> Set-Piece Takers
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="bg-[#0a0f1e] p-3 rounded-xl border border-[#1e2d40] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Penalties</span>
                  <div className="relative">
                    <select
                      value={tactics.takers.penalties}
                      onChange={(e) => setTactics({ ...tactics, takers: { ...tactics.takers, penalties: e.target.value } })}
                      className="appearance-none bg-transparent text-white font-bold text-xs pr-6 outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0f1623]">Auto-Assign (Highest SHO)</option>
                      {starters.map(p => <option key={p.id} value={p.id} className="bg-[#0f1623]">{p.name} ({p.overall})</option>)}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-[#0a0f1e] p-3 rounded-xl border border-[#1e2d40] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Corners</span>
                  <div className="relative">
                    <select
                      value={tactics.takers.corners}
                      onChange={(e) => setTactics({ ...tactics, takers: { ...tactics.takers, corners: e.target.value } })}
                      className="appearance-none bg-transparent text-white font-bold text-xs pr-6 outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0f1623]">Auto-Assign (Highest PAS)</option>
                      {starters.map(p => <option key={p.id} value={p.id} className="bg-[#0f1623]">{p.name} ({p.overall})</option>)}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
