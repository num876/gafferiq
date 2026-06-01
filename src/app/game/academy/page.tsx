/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ArrowUpRight, TrendingUp, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

const ACADEMY_UPGRADE_COSTS = {
  2: 2500000,
  3: 5000000,
  4: 10000000,
  5: 25000000
};

export default function AcademyPage() {
  const { activeSave, updateActiveSave } = useGame();
  const [notif, setNotif] = useState("");

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const academyPlayers = activeSave.players.filter(p => p.clubId === playerClub.id && p.isAcademy);
  const currentLevel = activeSave.academyLevel || 1;
  const nextLevelCost = ACADEMY_UPGRADE_COSTS[(currentLevel + 1) as keyof typeof ACADEMY_UPGRADE_COSTS];

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const upgradeAcademy = () => {
    if (currentLevel >= 5) return;
    if (activeSave.transferBudget < nextLevelCost) {
      showNotif("Insufficient Transfer Budget for upgrade.");
      return;
    }

    const newState = { ...activeSave };
    newState.transferBudget -= nextLevelCost;
    newState.academyLevel = currentLevel + 1;
    updateActiveSave(newState);
    showNotif(`Academy Upgraded to Level ${currentLevel + 1}!`);
  };

  const promotePlayer = (playerId: string) => {
    const newState = { ...activeSave };
    const player = newState.players.find(p => p.id === playerId);
    if (player) {
      player.isAcademy = false; // Promote to senior squad
      updateActiveSave(newState);
      showNotif(`${player.name} promoted to Senior Squad!`);
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-y-auto overflow-x-hidden p-8 space-y-8 custom-scrollbar pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-md">Youth Academy</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Develop the Next Generation</p>
        </div>
      </div>

      {/* Facility Status Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-sky-500/30 rounded-3xl p-8 relative overflow-hidden shadow-xl flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Level {currentLevel} Facility</h2>
            <p className="text-sm text-slate-400 font-medium">Higher levels increase the chance of generating Elite Wonderkids.</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-3 bg-black/40 p-6 rounded-2xl border border-white/5">
          {currentLevel < 5 ? (
            <>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Upgrade to Level {currentLevel + 1}</div>
              <div className="text-2xl font-black text-rose-400">€{(nextLevelCost).toLocaleString()}</div>
              <button 
                onClick={upgradeAcademy}
                className="mt-2 bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.4)]"
              >
                Purchase Upgrade
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-black uppercase tracking-widest">Max Level Reached</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">State of the art youth facilities.</p>
            </>
          )}
        </div>
      </div>

      {/* Youth Squad List */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl relative">
        <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-6">
          <GraduationCap className="w-5 h-5 text-emerald-400" /> Academy Prospects
        </h2>

        {academyPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest">No Prospects Found</h3>
            <p className="text-sm text-slate-500 mt-2">The next youth intake will arrive on Matchday 15 and 35.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="pb-3 pl-4">Player</th>
                  <th className="pb-3 text-center">Pos</th>
                  <th className="pb-3 text-center">Age</th>
                  <th className="pb-3 text-center">OVR</th>
                  <th className="pb-3 text-center">POT</th>
                  <th className="pb-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {academyPlayers.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-4 font-bold text-sm text-white">{p.name}</td>
                    <td className="py-4 text-center text-xs font-black text-slate-400">{p.position}</td>
                    <td className="py-4 text-center text-xs font-black text-slate-300">{p.age}</td>
                    <td className="py-4 text-center">
                      <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-black">{p.overall}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-1 rounded text-xs font-black">{p.potential}</span>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => promotePlayer(p.id)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/50 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1 mx-auto"
                      >
                        <ArrowUpRight className="w-3 h-3" /> Promote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 bg-sky-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-[0_10px_40px_rgba(56,189,248,0.4)] z-50 border-2 border-white"
          >
            {notif}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
