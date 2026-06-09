"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Shield, Sliders, Save, CheckCircle, ChevronDown, User, Activity, 
  Zap, Info, ChevronRight, ArrowRight, ToggleLeft, ToggleRight,
  Target, TrendingUp, Crosshair, Flag
} from "lucide-react";
import { 
  autoSelectLineup, TacticalInstructions, DEFAULT_TACTICS, 
  TACTIC_PRESETS, PLAYER_ROLES, computeTacticsRating
} from "../../../engine/simulator";
import { Player } from "../../../config/seededData";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type TacticsTab = "formation" | "instructions" | "setpieces";
type InstructionsSection = "inPossession" | "outOfPossession" | "transitions";

// ─────────────────────────────────────────────
// PITCH LAYOUT HELPER
// ─────────────────────────────────────────────
const getPitchSpots = (formation: string) => {
  type Spot = { label: string; x: number; y: number; role: "GK" | "DEF" | "MID" | "ATT"; roleOptions: string[] };
  const spots: Spot[] = [];

  const defRoles = ["Central Defender", "Ball-Playing Defender", "No-Nonsense CB", "Libero"];
  const wbRoles = ["Wing-Back", "Full-Back", "Inverted Wing-Back"];
  const cdmRoles = ["Anchor Man", "Regista", "Ball-Winning Mid", "Deep-Lying Playmaker"];
  const midRoles = ["Box-to-Box", "Deep-Lying Playmaker", "Advanced Playmaker", "Ball-Winning Mid", "Mezzala"];
  const wideMidRoles = ["Winger", "Inverted Winger", "Wide Midfielder"];
  const attRoles = ["Advanced Forward", "Target Man", "False 9", "Poacher", "Complete Forward", "Pressing Forward"];
  const wideAttRoles = ["Inside Forward", "Winger", "Inverted Winger", "Raumdeuter"];

  spots.push({ label: "GK", x: 50, y: 90, role: "GK", roleOptions: ["Goalkeeper", "Sweeper Keeper"] });

  const defY = 72;
  const midY = 48;
  const attY = 20;

  switch (formation) {
    case "4-4-2":
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM", x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM", x:37, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:63, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM", x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST", x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST", x:62, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "4-3-3":
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM", x:30, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:50, y:midY+8, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:70, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"LW", x:18, y:attY+5, role:"ATT", roleOptions:wideAttRoles });
      spots.push({ label:"ST", x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"RW", x:82, y:attY+5, role:"ATT", roleOptions:wideAttRoles });
      break;
    case "4-2-3-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:38, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CDM", x:62, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"LAM", x:20, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CAM", x:50, y:midY-5, role:"MID", roleOptions:["Advanced Playmaker","False 9","Mezzala"] });
      spots.push({ label:"RAM", x:80, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "3-5-2":
      spots.push({ label:"CB",  x:25, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3, role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:75, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"LWB", x:10, y:midY+5, role:"MID", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:50, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CM",  x:35, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:65, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"RWB", x:90, y:midY+5, role:"MID", roleOptions:wbRoles });
      spots.push({ label:"ST",  x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST",  x:62, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "5-3-2":
      spots.push({ label:"LWB", x:10, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:28, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:72, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RWB", x:90, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:30, y:midY,    role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:50, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:70, y:midY,    role:"MID", roleOptions:midRoles });
      spots.push({ label:"ST",  x:38, y:attY,    role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST",  x:62, y:attY,    role:"ATT", roleOptions:attRoles });
      break;
    case "4-5-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM",  x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:35, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CDM", x:50, y:midY+12, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CM",  x:65, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "3-4-3":
      spots.push({ label:"CB",  x:25, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:75, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"LM",  x:12, y:midY,    role:"MID", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:38, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:62, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY,    role:"MID", roleOptions:wbRoles });
      spots.push({ label:"LW",  x:18, y:attY+5,  role:"ATT", roleOptions:wideAttRoles });
      spots.push({ label:"ST",  x:50, y:attY,    role:"ATT", roleOptions:attRoles });
      spots.push({ label:"RW",  x:82, y:attY+5,  role:"ATT", roleOptions:wideAttRoles });
      break;
    case "4-1-4-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:50, y:midY+15, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"LM",  x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:37, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:63, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "4-3-2-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:30, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:50, y:midY+8, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:70, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"SS",  x:35, y:midY-8, role:"MID", roleOptions:["Advanced Playmaker","Mezzala","Inside Forward"] });
      spots.push({ label:"SS",  x:65, y:midY-8, role:"MID", roleOptions:["Advanced Playmaker","Mezzala","Inside Forward"] });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "5-4-1":
      spots.push({ label:"LWB", x:10, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:28, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:72, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RWB", x:90, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM",  x:12, y:midY,    role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:37, y:midY+6,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:63, y:midY+6,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY,    role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,    role:"ATT", roleOptions:attRoles });
      break;
    default:
      // 4-4-2 fallback
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM", x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM", x:37, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:63, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM", x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST", x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST", x:62, y:attY,   role:"ATT", roleOptions:attRoles });
  }

  return spots;
};

// ─────────────────────────────────────────────
// RATING BARS
// ─────────────────────────────────────────────
const RatingBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[10px] font-bold">
      <span className="text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-white">{(value * 100).toFixed(0)}</span>
    </div>
    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value * 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SEGMENTED CONTROL
// ─────────────────────────────────────────────
function SegmentedControl<T extends string>({ 
  label, options, value, onChange, colorFn, tooltip
}: { 
  label: string; options: T[]; value: T; onChange: (v: T) => void;
  colorFn?: (v: T) => string; tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span className="group relative">
              <Info className="w-3 h-3 text-slate-600 cursor-help" />
              <span className="absolute bottom-5 left-0 z-50 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] w-48 p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {tooltip}
              </span>
            </span>
          )}
        </label>
        <span className="text-[10px] font-black text-emerald-400">{value}</span>
      </div>
      <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-800 gap-0.5">
        {options.map(opt => {
          const active = value === opt;
          const color = colorFn ? colorFn(opt) : "bg-emerald-500";
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all truncate ${active ? `${color} text-white shadow-md` : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOGGLE SWITCH
// ─────────────────────────────────────────────
const ToggleSwitch = ({ label, value, onChange, tooltip, warning }: {
  label: string; value: boolean; onChange: (v: boolean) => void; tooltip?: string; warning?: string;
}) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
        {tooltip && (
          <span className="group relative">
            <Info className="w-3 h-3 text-slate-600 cursor-help" />
            <span className="absolute bottom-5 left-0 z-50 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] w-48 p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      {warning && value && <span className="text-[9px] text-amber-400 font-bold">⚠ {warning}</span>}
    </div>
    <button onClick={() => onChange(!value)} className="shrink-0">
      {value 
        ? <ToggleRight className="w-7 h-7 text-emerald-400" />
        : <ToggleLeft className="w-7 h-7 text-slate-600" />
      }
    </button>
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Tactics() {
  const { activeSave, updateActiveSave } = useGame();
  
  const [activeTab, setActiveTab] = useState<TacticsTab>("formation");
  const [instructionsSection, setInstructionsSection] = useState<InstructionsSection>("inPossession");
  const [formation, setFormation] = useState("4-3-3");
  const [tactics, setTactics] = useState<TacticalInstructions>(DEFAULT_TACTICS);
  const [starters, setStarters] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  const [notif, setNotif] = useState("");
  const [selectedNode, setSelectedNode] = useState<{ index: number; player: Player; spot: any } | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id && !p.isAcademy);

  useEffect(() => {
    if (!activeSave || initialized) return;
    if (activeSave.tactics) {
      setFormation(activeSave.tactics.formation);
      setTactics({ ...DEFAULT_TACTICS, ...activeSave.tactics.instructions });
      const savedStarters = activeSave.tactics.starters.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
      const savedBench    = activeSave.tactics.bench.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
      if (savedStarters.length === 11) {
        setStarters(savedStarters); setBench(savedBench); setInitialized(true); return;
      }
    }
    const { starters: s, bench: b } = autoSelectLineup(squad, formation);
    setStarters(s); setBench(b); setInitialized(true);
  }, [activeSave, initialized]);

  const handleFormationChange = (f: string) => {
    setFormation(f);
    setSelectedNode(null);
    const { starters: s, bench: b } = autoSelectLineup(squad, f);
    setStarters(s); setBench(b);
  };

  const applyPreset = (idx: number) => {
    const preset = TACTIC_PRESETS[idx];
    setTactics({ ...DEFAULT_TACTICS, ...preset.instructions });
    handleFormationChange(preset.formation);
    setNotif(`Preset "${preset.name}" applied!`);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleSave = () => {
    updateActiveSave({
      ...activeSave,
      tactics: {
        formation,
        instructions: tactics,
        starters: starters.map(p => p.id),
        bench: bench.map(p => p.id)
      },
      gameLog: [`Tactical setup saved.`, ...activeSave.gameLog]
    });
    setNotif("Tactical Setup Saved!");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleSwap = (starterIdx: number, benchId: string) => {
    const activeStarter = starters[starterIdx];
    const activeBench = bench.find(p => p.id === benchId)!;
    const ns = [...starters]; ns[starterIdx] = activeBench;
    const nb = bench.map(p => p.id === benchId ? activeStarter : p);
    setStarters(ns); setBench(nb);
    setNotif(`Swapped ${activeStarter.name} with ${activeBench.name}`);
    setTimeout(() => setNotif(""), 2000);
    setSelectedNode(null);
  };

  const setPlayerRole = (playerId: string, role: string) => {
    setTactics(t => ({ ...t, playerRoles: { ...(t.playerRoles || {}), [playerId]: role } }));
  };

  const setPlayerDuty = (playerId: string, duty: "Attack" | "Support" | "Defend") => {
    setTactics(t => ({ ...t, playerDuties: { ...(t.playerDuties || {}), [playerId]: duty } }));
  };

  const pitchSpots = getPitchSpots(formation);

  // Compute live ratings for bar display
  const homeRating = starters.length >= 11 ? computeTacticsRating(starters, tactics, true) : null;

  const dutyColor = (d: "Attack" | "Support" | "Defend") => 
    d === "Attack" ? "bg-rose-500" : d === "Defend" ? "bg-sky-500" : "bg-amber-500";

  const FORMATIONS = ["4-4-2","4-3-3","4-2-3-1","3-5-2","5-3-2","4-5-1","3-4-3","4-1-4-1","4-3-2-1","5-4-1"];

  return (
    <div className="flex flex-col gap-0 font-sans h-full">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center border-b border-slate-800/50 pb-4 mb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" /> Tactics Board
          </h2>
          <p className="text-xs text-slate-500 mt-1">Build your system. Shape your identity.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {notif && (
              <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> {notif}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition active:scale-95 uppercase tracking-wider">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* ── MAIN TAB BAR ── */}
      <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {([
          { id:"formation" as TacticsTab,    label:"Formation & Lineup", icon:Shield },
          { id:"instructions" as TacticsTab, label:"Team Instructions",  icon:Sliders },
          { id:"setpieces" as TacticsTab,    label:"Set Pieces",          icon:Flag },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === id ? "bg-slate-700 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-hidden">
        
        {/* ════════════════════════════════════════
            FORMATION TAB
        ════════════════════════════════════════ */}
        {activeTab === "formation" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            
            {/* Left: pitch */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              
              {/* Formation picker */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-1.5 flex items-center overflow-x-auto gap-1 scrollbar-hide">
                {FORMATIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => handleFormationChange(f)}
                    className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all shrink-0 ${formation === f ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* SVG Pitch */}
              <div className="relative w-full max-w-[480px] mx-auto aspect-[3/4] bg-[#166534] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#0f4b23] select-none">
                
                {/* Pitch SVG */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-0 opacity-40">
                  <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="0.5" fill="white" />
                  <rect x="20" y="0" width="60" height="15" fill="none" stroke="white" strokeWidth="0.5" />
                  <rect x="20" y="85" width="60" height="15" fill="none" stroke="white" strokeWidth="0.5" />
                  <rect x="35" y="0" width="30" height="5" fill="none" stroke="white" strokeWidth="0.5" />
                  <rect x="35" y="95" width="30" height="5" fill="none" stroke="white" strokeWidth="0.5" />
                  <circle cx="50" cy="10" r="0.5" fill="white" />
                  <circle cx="50" cy="90" r="0.5" fill="white" />
                </svg>

                {/* Grass stripes */}
                <div className="absolute inset-0 flex pointer-events-none opacity-15 mix-blend-overlay">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-full flex-1 ${i%2===0 ? "bg-black" : "bg-transparent"}`} />
                  ))}
                </div>

                {/* Formation watermark */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-10">
                  <span className="text-7xl font-black text-white rotate-[-8deg]">{formation}</span>
                </div>

                {/* Player nodes */}
                <div className="absolute inset-0 z-10">
                  {pitchSpots.map((spot, idx) => {
                    const player = starters[idx];
                    if (!player) return null;
                    const isSelected = selectedNode?.index === idx;
                    const duty = (tactics.playerDuties || {})[player.id] || "Support";
                    const role = (tactics.playerRoles || {})[player.id];
                    const dutyBg = duty === "Attack" ? "bg-rose-500" : duty === "Defend" ? "bg-sky-500" : "bg-amber-500";

                    return (
                      <motion.div
                        key={player.id}
                        layoutId={`player-${player.id}`}
                        animate={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => setSelectedNode(isSelected ? null : { index: idx, player, spot })}
                        className="absolute w-12 h-12 flex flex-col items-center justify-center -ml-6 -mt-6 cursor-pointer group z-20"
                      >
                        {/* Position label */}
                        <div className="absolute -top-3.5 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[8px] font-black text-emerald-400 z-30 shadow-lg whitespace-nowrap">
                          {spot.label}
                        </div>
                        {/* Node */}
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-white text-xs shadow-xl transition-all relative ${isSelected ? "bg-emerald-500 border-white scale-110 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-[#0f1623] border-emerald-500 group-hover:border-white group-hover:scale-105"}`}>
                          {player.overall}
                          {/* Duty badge */}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-900 ${dutyBg} text-[5px] flex items-center justify-center font-black text-white`}>
                            {duty[0]}
                          </div>
                        </div>
                        {/* Name */}
                        <div className="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700/50 text-[8px] font-bold text-white whitespace-nowrap z-30 max-w-[70px] truncate shadow-lg">
                          {player.name.split(" ").pop()}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Popover */}
                <AnimatePresence>
                  {selectedNode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute z-50 p-4 rounded-2xl bg-slate-950/98 backdrop-blur-xl border border-slate-700 shadow-2xl w-60"
                      style={{
                        left: `${selectedNode.spot.x > 55 ? Math.max(5, selectedNode.spot.x - 55) : Math.min(50, selectedNode.spot.x + 5)}%`,
                        top:  `${selectedNode.spot.y > 55 ? Math.max(5, selectedNode.spot.y - 40) : Math.min(60, selectedNode.spot.y + 5)}%`,
                      }}
                    >
                      {/* Player info */}
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <h4 className="font-black text-white text-xs leading-tight">{selectedNode.player.name}</h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                            {selectedNode.player.position} · {selectedNode.player.age}y · {selectedNode.player.overall} OVR
                          </p>
                        </div>
                        <button onClick={() => setSelectedNode(null)} className="text-slate-600 hover:text-white text-xs font-bold">✕</button>
                      </div>

                      {/* Duty selector */}
                      <div className="mb-3">
                        <span className="text-[9px] text-slate-500 font-black uppercase mb-1.5 block">Player Duty</span>
                        <div className="flex gap-1">
                          {(["Defend", "Support", "Attack"] as const).map(d => {
                            const active = ((tactics.playerDuties || {})[selectedNode.player.id] || "Support") === d;
                            return (
                              <button
                                key={d}
                                onClick={() => setPlayerDuty(selectedNode.player.id, d)}
                                className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                  active ? (d === "Attack" ? "bg-rose-500 text-white" : d === "Defend" ? "bg-sky-500 text-white" : "bg-amber-500 text-white")
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                              >
                                {d[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Role selector */}
                      <div className="mb-3">
                        <span className="text-[9px] text-slate-500 font-black uppercase mb-1.5 block">Tactical Role</span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-emerald-500"
                            value={(tactics.playerRoles || {})[selectedNode.player.id] || selectedNode.spot.roleOptions[0]}
                            onChange={e => setPlayerRole(selectedNode.player.id, e.target.value)}
                          >
                            {selectedNode.spot.roleOptions.map((r: string) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        {/* Role description */}
                        {(() => {
                          const roleName = (tactics.playerRoles || {})[selectedNode.player.id] || selectedNode.spot.roleOptions[0];
                          const roleDef = PLAYER_ROLES[roleName];
                          return roleDef ? (
                            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed italic">{roleDef.description}</p>
                          ) : null;
                        })()}
                      </div>

                      {/* Swap */}
                      <div className="border-t border-slate-800 pt-3">
                        <span className="text-[9px] text-slate-500 font-black uppercase mb-1.5 block">Swap With Bench</span>
                        <div className="relative">
                          <select
                            onChange={e => { if(e.target.value) handleSwap(selectedNode.index, e.target.value); }}
                            className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
                            value=""
                          >
                            <option value="" disabled>Select replacement...</option>
                            {bench.map(b => (
                              <option key={b.id} value={b.id}>{b.name} ({b.position} {b.overall})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: ratings + presets + bench */}
            <div className="xl:col-span-5 flex flex-col gap-5">
              
              {/* Team Strength Bars */}
              {homeRating && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Predicted Strength
                  </h4>
                  <div className="flex flex-col gap-3">
                    <RatingBar label="Attack"   value={homeRating.attack}   color="bg-rose-500" />
                    <RatingBar label="Midfield" value={homeRating.midfield} color="bg-amber-500" />
                    <RatingBar label="Defence"  value={homeRating.defense}  color="bg-sky-500" />
                  </div>
                  <p className="text-[9px] text-slate-600 mt-3 italic">Fatigue rate: {homeRating.fatigueRate.toFixed(2)}× — {homeRating.fatigueRate > 1.1 ? "High intensity, manage fitness carefully" : homeRating.fatigueRate < 0.9 ? "Low tempo, good for recovery weeks" : "Balanced workload"}</p>
                </div>
              )}

              {/* Tactic Presets */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Presets
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {TACTIC_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(idx)}
                      className="group text-left bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700 hover:border-slate-500 rounded-xl p-3 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{preset.badge}</span>
                        <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">{preset.name}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{preset.description}</p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
                        <span>{preset.formation}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{preset.instructions.mentality}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bench */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bench</h4>
                <div className="flex flex-col gap-1.5">
                  {bench.slice(0, 7).map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/30 border border-slate-800/50">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{p.overall}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[9px] text-slate-500">{p.position} · {p.age}y</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TEAM INSTRUCTIONS TAB
        ════════════════════════════════════════ */}
        {activeTab === "instructions" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Section sub-tabs */}
            <div className="lg:col-span-12">
              <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 max-w-md">
                {([
                  { id:"inPossession" as InstructionsSection,    label:"In Possession",     icon:TrendingUp },
                  { id:"outOfPossession" as InstructionsSection, label:"Out of Possession",  icon:Crosshair },
                  { id:"transitions" as InstructionsSection,     label:"Transitions",        icon:ArrowRight },
                ]).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setInstructionsSection(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${instructionsSection === id ? "bg-slate-700 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* IN POSSESSION */}
            {instructionsSection === "inPossession" && (
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> In Possession Instructions
                  </h3>
                  
                  <SegmentedControl<"Attacking"|"Balanced"|"Defensive">
                    label="Mentality"
                    options={["Defensive","Balanced","Attacking"]}
                    value={tactics.mentality}
                    onChange={v => setTactics(t => ({...t, mentality: v}))}
                    colorFn={v => v==="Attacking" ? "bg-rose-500" : v==="Balanced" ? "bg-emerald-500" : "bg-sky-500"}
                    tooltip="Sets the team's overall risk profile. Attacking pushes more men forward; Defensive sits deeper."
                  />
                  <SegmentedControl<"Wide"|"Standard"|"Narrow">
                    label="Width"
                    options={["Narrow","Standard","Wide"]}
                    value={tactics.width}
                    onChange={v => setTactics(t => ({...t, width: v}))}
                    colorFn={v => v==="Wide" ? "bg-amber-500" : v==="Narrow" ? "bg-indigo-500" : "bg-emerald-500"}
                    tooltip="Wide stretches the pitch and uses flanks. Narrow overloads central channels."
                  />
                  <SegmentedControl<"Fast"|"Normal"|"Slow">
                    label="Tempo"
                    options={["Slow","Normal","Fast"]}
                    value={tactics.tempo}
                    onChange={v => setTactics(t => ({...t, tempo: v}))}
                    colorFn={v => v==="Fast" ? "bg-rose-500" : v==="Slow" ? "bg-blue-500" : "bg-emerald-500"}
                    tooltip="Fast tempo uses more energy but creates more chances. Slow keeps possession but is less direct."
                  />
                  <SegmentedControl<"Direct"|"Mixed"|"Short">
                    label="Passing Directness"
                    options={["Short","Mixed","Direct"]}
                    value={tactics.passingDirectness}
                    onChange={v => setTactics(t => ({...t, passingDirectness: v}))}
                    colorFn={v => v==="Direct" ? "bg-amber-500" : v==="Short" ? "bg-sky-500" : "bg-emerald-500"}
                    tooltip="Direct balls bypass midfield quickly. Short build-up is safer but slower."
                  />
                  <SegmentedControl<"Often"|"Sometimes"|"Rarely">
                    label="Crossing Frequency"
                    options={["Rarely","Sometimes","Often"]}
                    value={tactics.crossingFrequency}
                    onChange={v => setTactics(t => ({...t, crossingFrequency: v}))}
                    colorFn={v => v==="Often" ? "bg-rose-500" : v==="Rarely" ? "bg-slate-600" : "bg-emerald-500"}
                    tooltip="How often wide players will deliver crosses into the box."
                  />
                </div>
              </div>
            )}

            {/* OUT OF POSSESSION */}
            {instructionsSection === "outOfPossession" && (
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Crosshair className="w-4 h-4 text-rose-400" /> Out of Possession Instructions
                  </h3>

                  <SegmentedControl<"High"|"Mid"|"Low"|"None">
                    label="Press Intensity"
                    options={["None","Low","Mid","High"]}
                    value={tactics.pressIntensity}
                    onChange={v => setTactics(t => ({...t, pressIntensity: v}))}
                    colorFn={v => v==="High" ? "bg-rose-500" : v==="None" ? "bg-slate-600" : "bg-amber-500"}
                    tooltip="High press wins the ball higher up the pitch but drains energy rapidly."
                  />
                  <SegmentedControl<"High"|"Standard"|"Deep">
                    label="Defensive Line"
                    options={["Deep","Standard","High"]}
                    value={tactics.defensiveLine}
                    onChange={v => setTactics(t => ({...t, defensiveLine: v}))}
                    colorFn={v => v==="High" ? "bg-rose-500" : v==="Deep" ? "bg-sky-500" : "bg-emerald-500"}
                    tooltip="High line compresses space but is vulnerable to balls behind. Deep is safer."
                  />
                  <SegmentedControl<"High"|"Mid"|"Low">
                    label="Press Trigger"
                    options={["Low","Mid","High"]}
                    value={tactics.pressingTrigger}
                    onChange={v => setTactics(t => ({...t, pressingTrigger: v}))}
                    colorFn={v => v==="High" ? "bg-rose-500" : v==="Low" ? "bg-sky-500" : "bg-amber-500"}
                    tooltip="When your team starts pressing. High = immediately when opponent receives; Low = only deep in your half."
                  />

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <ToggleSwitch
                      label="Offside Trap"
                      value={tactics.offsideTrap}
                      onChange={v => setTactics(t => ({...t, offsideTrap: v}))}
                      tooltip="Defenders step up in unison to catch attackers offside. High risk, high reward."
                      warning="Can be beaten by a well-timed through ball"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TRANSITIONS */}
            {instructionsSection === "transitions" && (
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
                    <ArrowRight className="w-4 h-4 text-amber-400" /> Transition Instructions
                  </h3>

                  <SegmentedControl<"Rapid"|"Balanced"|"Patient">
                    label="Counter-Attack Speed"
                    options={["Patient","Balanced","Rapid"]}
                    value={tactics.counterAttackSpeed}
                    onChange={v => setTactics(t => ({...t, counterAttackSpeed: v}))}
                    colorFn={v => v==="Rapid" ? "bg-rose-500" : v==="Patient" ? "bg-sky-500" : "bg-amber-500"}
                    tooltip="Rapid unleashes fast breaks the moment possession is won. Patient builds more carefully."
                  />

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <ToggleSwitch
                      label="Counter-Press (Gegenpressing)"
                      value={tactics.counterPress}
                      onChange={v => setTactics(t => ({...t, counterPress: v}))}
                      tooltip="Immediately after losing the ball, every nearby player swarms to win it back. Very energy-intensive."
                      warning="Significantly increases fatigue — rotate squad"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Right sidebar — mentality summary */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tactic Summary</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label:"Mentality",     value: tactics.mentality },
                    { label:"Width",         value: tactics.width },
                    { label:"Tempo",         value: tactics.tempo },
                    { label:"Press",         value: tactics.pressIntensity },
                    { label:"Def. Line",     value: tactics.defensiveLine },
                    { label:"Build-up",      value: tactics.passingDirectness },
                    { label:"Crossing",      value: tactics.crossingFrequency },
                    { label:"Counter Speed", value: tactics.counterAttackSpeed },
                    { label:"Offside Trap",  value: tactics.offsideTrap ? "On" : "Off" },
                    { label:"Counter-Press", value: tactics.counterPress ? "On" : "Off" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">{label}</span>
                      <span className="text-white font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {homeRating && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Predicted Impact</h4>
                  <div className="flex flex-col gap-3">
                    <RatingBar label="Attack"   value={homeRating.attack}   color="bg-rose-500" />
                    <RatingBar label="Midfield" value={homeRating.midfield} color="bg-amber-500" />
                    <RatingBar label="Defence"  value={homeRating.defense}  color="bg-sky-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            SET PIECES TAB
        ════════════════════════════════════════ */}
        {activeTab === "setpieces" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Attacking Set Pieces */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
              <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
                <Target className="w-4 h-4 text-emerald-400" /> Attacking Set Pieces
              </h3>
              
              <SegmentedControl<"Near Post"|"Far Post"|"Short"|"Whipped In">
                label="Corner Routine"
                options={["Near Post","Far Post","Short","Whipped In"]}
                value={tactics.cornerRoutine}
                onChange={v => setTactics(t => ({...t, cornerRoutine: v}))}
                colorFn={v => v==="Whipped In" ? "bg-amber-500" : v==="Short" ? "bg-blue-500" : "bg-emerald-500"}
                tooltip="Whipped In has a higher goal probability from corners. Short exploits space outside the box."
              />

              {/* Set Piece Takers */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Set-Piece Takers</h4>
                
                {[
                  { label: "Penalties", key: "penalties" as keyof typeof tactics.takers },
                  { label: "Corners",   key: "corners"   as keyof typeof tactics.takers },
                  { label: "Free Kicks", key: "freeKicks" as keyof typeof tactics.takers },
                ].map(({ label, key }) => (
                  <div key={key} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[9px] text-slate-400 font-black uppercase block mb-1.5">{label}</span>
                    <div className="relative">
                      <select
                        value={tactics.takers[key]}
                        onChange={e => setTactics(t => ({ ...t, takers: { ...t.takers, [key]: e.target.value } }))}
                        className="w-full appearance-none bg-transparent text-white font-bold text-xs pr-6 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">Auto (best stat)</option>
                        {starters.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.overall} OVR)</option>)}
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defensive Set Pieces */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
              <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
                <Shield className="w-4 h-4 text-sky-400" /> Defensive Set Pieces
              </h3>

              <SegmentedControl<"Zonal"|"Man-to-Man"|"Mixed">
                label="Defensive Marking at Set Pieces"
                options={["Zonal","Mixed","Man-to-Man"]}
                value={tactics.defensiveSetPiece}
                onChange={v => setTactics(t => ({...t, defensiveSetPiece: v}))}
                colorFn={v => v==="Zonal" ? "bg-sky-500" : v==="Man-to-Man" ? "bg-rose-500" : "bg-amber-500"}
                tooltip="Zonal marking defends areas of the box. Man-to-Man tracks individual opponents. Mixed combines both."
              />

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-[10px] font-black text-slate-400 mb-3">Corner Defenders</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Corner kick threats are mitigated by your defensive marking scheme and the height of your tallest defenders.
                  <span className="block mt-2 text-slate-400">
                    Tallest defender: {starters.filter(p=>p.position==="DEF").sort((a,b)=>(b.physical||0)-(a.physical||0))[0]?.name || "N/A"}
                  </span>
                </p>
              </div>

              {/* Info cards */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                {[
                  { scheme: "Zonal",      pro: "Organised & predictable", con: "Can be blocked away from ball" },
                  { scheme: "Man-to-Man", pro: "No free runners",          con: "Players dragged out of position" },
                  { scheme: "Mixed",      pro: "Best of both worlds",       con: "Requires good communication" },
                ].map(s => (
                  <div key={s.scheme} className={`flex items-start gap-2 p-2.5 rounded-lg border ${tactics.defensiveSetPiece===s.scheme ? "bg-sky-500/10 border-sky-500/30" : "bg-slate-900/50 border-transparent"}`}>
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${tactics.defensiveSetPiece===s.scheme ? "bg-sky-400" : "bg-slate-600"}`} />
                    <div>
                      <div className="text-[10px] font-black text-white">{s.scheme}</div>
                      <div className="text-[9px] text-emerald-400">✓ {s.pro}</div>
                      <div className="text-[9px] text-rose-400">✗ {s.con}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
