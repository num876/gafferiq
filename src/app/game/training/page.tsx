/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Plus, Zap, Activity, Shield, Crosshair, Brain, Trash2, HeartPulse, Target, UserCheck, Flame } from "lucide-react";
import { Player } from "../../../config/seededData";

const COACH_TYPES = [
  { type: "Attacking", icon: Crosshair, color: "text-rose-400", bg: "bg-rose-500", border: "border-rose-500/30", desc: "Boosts Shooting, Passing & Dribbling." },
  { type: "Defensive", icon: Shield, color: "text-blue-400", bg: "bg-blue-500", border: "border-blue-500/30", desc: "Boosts Defending & Physical." },
  { type: "Fitness", icon: HeartPulse, color: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/30", desc: "Boosts Stamina & Pace. Offsets Ageing." },
  { type: "Tactical", icon: Brain, color: "text-purple-400", bg: "bg-purple-500", border: "border-purple-500/30", desc: "Boosts Mental & Passing." }
];

export default function TrainingPage() {
  const { activeSave, updateActiveSave } = useGame();
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [hireType, setHireType] = useState("");
  const [hireLevel, setHireLevel] = useState(1);
  const [notif, setNotif] = useState("");

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find((c) => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter((p) => p.clubId === playerClub.id && !p.isAcademy).sort((a, b) => b.overall - a.overall);

  // Calculate current impacts
  const coachImpacts = {
    "Attacking": 1,
    "Defensive": 1,
    "Fitness": 1,
    "Tactical": 1
  };
  activeSave.coaches.forEach(c => {
    if (coachImpacts[c.type as keyof typeof coachImpacts] !== undefined) {
      coachImpacts[c.type as keyof typeof coachImpacts] += (c.level * 0.25);
    }
  });

  const setPlayerFocus = (playerId: string, focus: "Balanced" | "Attacking" | "Defensive" | "Fitness" | "Tactical") => {
    const newState = { ...activeSave };
    const p = newState.players.find(p => p.id === playerId);
    if (p) p.trainingFocus = focus;
    updateActiveSave(newState);
  };

  const setTeamFocus = (focus: "Balanced" | "Attacking" | "Defensive" | "Fitness" | "Tactical") => {
    const newState = { ...activeSave };
    newState.players.filter(p => p.clubId === playerClub.id && !p.isAcademy).forEach(p => {
      p.trainingFocus = focus;
    });
    showNotif(`Team Focus set to ${focus}`);
    updateActiveSave(newState);
  };

  const hireCoach = () => {
    if (!hireType) return;
    const wageCost = hireLevel * 1500;
    
    if (wageCost > activeSave.wageBudget) {
      showNotif("Insufficient wage budget to hire this coach.");
      return;
    }

    const newState = { ...activeSave };
    newState.wageBudget -= wageCost;
    newState.coaches.push({
      id: `coach_${Date.now()}`,
      type: hireType as any,
      level: hireLevel,
      wage: wageCost
    });
    
    showNotif(`Hired Level ${hireLevel} ${hireType} Coach`);
    updateActiveSave(newState);
    setHireModalOpen(false);
  };

  const fireCoach = (coachId: string, wage: number) => {
    const newState = { ...activeSave };
    newState.wageBudget += wage;
    newState.coaches = newState.coaches.filter(c => c.id !== coachId);
    updateActiveSave(newState);
    showNotif("Coach Fired");
  };

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-y-auto overflow-x-hidden p-8 space-y-8 custom-scrollbar pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-md">Training Grounds</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Manage Squad Focus & Coaching Staff</p>
        </div>
        <button 
          onClick={() => setHireModalOpen(true)}
          className="bg-green-500 hover:bg-green-400 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Hire Coach
        </button>
      </div>

      {/* Staff & Impact Impact Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {COACH_TYPES.map(ct => {
          const matchingCoaches = activeSave.coaches.filter(c => c.type === ct.type);
          const totalLevel = matchingCoaches.reduce((acc, c) => acc + c.level, 0);
          const multiplier = coachImpacts[ct.type as keyof typeof coachImpacts];

          return (
            <div key={ct.type} className={`bg-slate-900/60 backdrop-blur-2xl border ${ct.border} rounded-3xl p-6 relative overflow-hidden shadow-xl`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${ct.bg} rounded-full blur-[80px] opacity-20 pointer-events-none`} />
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center ${ct.color} shadow-lg`}>
                  <ct.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-wider text-sm">{ct.type}</h3>
                  <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Growth Multiplier</div>
                </div>
              </div>

              <div className="flex items-end gap-2 mb-4 relative z-10">
                <span className="text-4xl font-black text-white">{multiplier.toFixed(2)}x</span>
                {multiplier > 1 && <Flame className="w-5 h-5 text-orange-500 mb-1 animate-pulse" />}
              </div>

              {/* Staff List */}
              <div className="space-y-2 mt-4 relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Assigned Coaches</h4>
                {matchingCoaches.length === 0 ? (
                  <p className="text-xs text-slate-600 font-medium">No {ct.type} coaches hired.</p>
                ) : (
                  matchingCoaches.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-white/5">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-white font-bold">Level {c.level}</span>
                      </div>
                      <button onClick={() => fireCoach(c.id, c.wage)} className="text-slate-500 hover:text-rose-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Squad Training Table */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Target className="w-5 h-5 text-sky-400" /> Player Focus & Sharpness
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Set All:</span>
            <select 
              className="bg-black/50 text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/10 outline-none"
              onChange={(e) => setTeamFocus(e.target.value as any)}
              defaultValue="Select"
            >
              <option disabled>Select</option>
              <option>Balanced</option>
              <option>Attacking</option>
              <option>Defensive</option>
              <option>Fitness</option>
              <option>Tactical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-3 pl-4">Player</th>
                <th className="pb-3 text-center">Pos</th>
                <th className="pb-3 text-center">OVR</th>
                <th className="pb-3 text-center">Pot</th>
                <th className="pb-3 w-48">Match Sharpness</th>
                <th className="pb-3 w-48">Training Focus</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((p) => {
                const sharpness = p.sharpness || 50;
                let sharpColor = "bg-green-500";
                if (sharpness < 40) sharpColor = "bg-red-500";
                else if (sharpness < 70) sharpColor = "bg-yellow-500";

                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-4 font-bold text-sm text-white">{p.name}</td>
                    <td className="py-3 text-center text-xs font-black text-slate-400">{p.position}</td>
                    <td className="py-3 text-center">
                      <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-black">{p.overall}</span>
                    </td>
                    <td className="py-3 text-center text-xs font-black text-sky-400">{p.potential}</td>
                    <td className="py-3 pr-8">
                      <div className="flex items-center gap-3">
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${sharpColor} transition-all`} style={{ width: `${sharpness}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 w-6 text-right">{Math.round(sharpness)}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={p.trainingFocus}
                        onChange={(e) => setPlayerFocus(p.id, e.target.value as any)}
                        className="w-full bg-slate-800/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-sky-500 transition"
                      >
                        <option value="Balanced">Balanced (Recovers)</option>
                        <option value="Attacking">Attacking</option>
                        <option value="Defensive">Defensive</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Tactical">Tactical</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hire Modal */}
      <AnimatePresence>
        {hireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05080f]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Hire Coach</h2>
              
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coach Type</label>
                  <select 
                    value={hireType} 
                    onChange={e => setHireType(e.target.value)}
                    className="bg-slate-800 text-white font-bold px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-green-500"
                  >
                    <option value="" disabled>Select Specialty...</option>
                    <option value="Attacking">Attacking</option>
                    <option value="Defensive">Defensive</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Tactical">Tactical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coach Level (1-5)</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(l => (
                      <button 
                        key={l}
                        onClick={() => setHireLevel(l)}
                        className={`flex-1 py-2 rounded-lg font-black text-sm border transition ${hireLevel === l ? 'bg-green-500 text-slate-950 border-green-400' : 'bg-slate-800 text-white border-white/10 hover:border-white/30'}`}
                      >
                        Lvl {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Wage Cost:</span>
                  <span className="text-lg font-black text-rose-400">€{(hireLevel * 1500).toLocaleString()}</span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setHireModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition">Cancel</button>
                  <button onClick={hireCoach} disabled={!hireType} className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition ${hireType ? 'bg-green-500 hover:bg-green-400 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Confirm Hire</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 bg-green-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-[0_10px_40px_rgba(34,197,94,0.4)] z-50 border-2 border-white"
          >
            {notif}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
