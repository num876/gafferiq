"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { Player, calculateValue, LEAGUE_INFO } from "../../../config/seededData";
import { 
  X, Check, User, Heart, ArrowLeftRight, Landmark, Zap
} from "lucide-react";
import { CLUB_LOGOS } from "../../../config/clubLogos";
import { motion, AnimatePresence } from "framer-motion";

const generateAttributes = (player: Player) => ({
  pac: player.pace || player.overall,
  sho: player.shooting || player.overall,
  pas: player.passing || player.overall,
  def: player.defending || player.overall,
  phy: player.physical || player.overall,
});

export default function Transfers() {
  const { activeSave, updateActiveSave } = useGame();
  const [activeTab, setActiveTab] = useState<"swipe" | "squad">("swipe");
  
  // Swipe State
  const [targetPlayers, setTargetPlayers] = useState<Player[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  
  // Bid State
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidResult, setBidResult] = useState<string | null>(null);

  const playerClub = activeSave?.clubs.find((c) => c.id === activeSave.selectedClubId);

  // Generate 10 targets based on matchday
  useEffect(() => {
    if (!activeSave || !playerClub) return;
    
    // Simple seeded randomizer based on matchday
    let seed = activeSave.currentMatchday * 12345;
    const random = () => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Filter potential targets (similar rep, not in our club)
    const potentials = activeSave.players.filter(p => {
      if (p.clubId === playerClub.id) return false;
      const club = activeSave.clubs.find(c => c.id === p.clubId);
      if (!club) return p.overall >= 60; // Free agents
      return Math.abs(club.reputation - playerClub.reputation) <= 15; // Similar level
    });

    // Shuffle and pick 10
    const shuffled = [...potentials].sort(() => 0.5 - random());
    setTargetPlayers(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setBidResult(null);
  }, [activeSave?.currentMatchday]);

  if (!activeSave || !playerClub) return null;

  const currentPlayer = targetPlayers[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === "right" && currentPlayer) {
        setBidModalOpen(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
      }
    }, 300);
  };

  const executeBid = () => {
    if (!currentPlayer) return;
    
    const value = currentPlayer.value;
    const club = activeSave.clubs.find(c => c.id === currentPlayer.clubId);
    
    // Quick Sim Bid Logic: 50% chance of accepting base value + 10%, otherwise reject
    const demand = value * 1.1;
    
    if (activeSave.transferBudget < demand) {
       setBidResult(`Insufficient funds! They demand €${(demand/1000000).toFixed(1)}M but you only have €${(activeSave.transferBudget/1000000).toFixed(1)}M.`);
       return;
    }

    const accepts = Math.random() > 0.4;
    
    if (accepts || currentPlayer.clubId === "free_agent") {
       setBidResult(`Transfer Accepted! ${currentPlayer.name} joins ${playerClub.shortName} for €${(demand/1000000).toFixed(1)}M.`);
       
       const newState = { ...activeSave };
       const pIdx = newState.players.findIndex(p => p.id === currentPlayer.id);
       if (pIdx > -1) {
          newState.players[pIdx] = {
             ...newState.players[pIdx],
             clubId: playerClub.id,
             wage: Math.floor(currentPlayer.wage * 1.1) || 5000,
             contractExpiry: newState.currentSeason + 3,
             morale: 95
          };
          newState.transferBudget -= demand;
          newState.gameLog.unshift(`Signed ${currentPlayer.name} for €${(demand/1000000).toFixed(1)}M.`);
          updateActiveSave(newState);
       }
    } else {
       setBidResult(`Bid Rejected. ${club?.name || "The player"} walked away from negotiations.`);
    }
  };

  const closeBidModal = () => {
    setBidModalOpen(false);
    setBidResult(null);
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const squadPlayers = activeSave.players.filter(p => p.clubId === playerClub.id);

  const instantSell = (p: Player) => {
    const newState = { ...activeSave };
    const pIdx = newState.players.findIndex(x => x.id === p.id);
    if (pIdx > -1) {
       newState.players[pIdx].clubId = "free_agent";
       newState.transferBudget += p.value;
       newState.gameLog.unshift(`Sold ${p.name} for €${(p.value/1000000).toFixed(1)}M.`);
       updateActiveSave(newState);
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative font-sans overflow-hidden">
      
      {/* HEADER TABS */}
      <div className="flex bg-[#0f1623] p-1.5 rounded-2xl mx-4 mt-4 border border-[#1e2d40] shadow-xl relative z-20 shrink-0">
        <button
          onClick={() => setActiveTab("swipe")}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "swipe" ? "bg-[#22c55e] text-slate-950 shadow-md" : "text-slate-400"}`}
        >
          Daily Targets
        </button>
        <button
          onClick={() => setActiveTab("squad")}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "squad" ? "bg-[#f59e0b] text-slate-950 shadow-md" : "text-slate-400"}`}
        >
          Sell Players
        </button>
      </div>

      {/* SWIPE MARKET */}
      {activeTab === "swipe" && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
          
          {/* Card Stack Area */}
          <div className="relative w-full max-w-[320px] aspect-[3/4]">
            <AnimatePresence>
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.id}
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: 0,
                    x: swipeDirection === "left" ? -300 : swipeDirection === "right" ? 300 : 0,
                    rotate: swipeDirection === "left" ? -15 : swipeDirection === "right" ? 15 : 0
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute inset-0 bg-[#0f1623] rounded-[2rem] border border-[#1e2d40] shadow-2xl overflow-hidden flex flex-col"
                  style={{ zIndex: 10 }}
                >
                  {/* Card Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e2d40] via-[#0f1623] to-[#0a0f1e] opacity-50" />
                  
                  {/* Player Header */}
                  <div className="relative p-6 flex flex-col items-center text-center gap-2 border-b border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-[#080c14] border border-[#1e2d40] flex items-center justify-center shadow-inner overflow-hidden mb-2">
                       {CLUB_LOGOS[currentPlayer.clubId] ? (
                         <img src={CLUB_LOGOS[currentPlayer.clubId]} className="w-10 h-10 object-contain" />
                       ) : (
                         <User className="w-8 h-8 text-slate-600" />
                       )}
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{currentPlayer.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="bg-[#1e2d40] px-2 py-0.5 rounded">{currentPlayer.position}</span>
                      <span>•</span>
                      <span>{currentPlayer.age} YRS</span>
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="relative p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-center mb-6">
                       <div className="w-20 h-20 rounded-full border-[3px] border-[#22c55e] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                         <span className="text-4xl font-black text-white">{currentPlayer.overall}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 w-full mt-auto">
                      {[
                        { lbl: "PAC", val: generateAttributes(currentPlayer).pac, color: "bg-blue-400" },
                        { lbl: "SHO", val: generateAttributes(currentPlayer).sho, color: "bg-rose-400" },
                        { lbl: "PAS", val: generateAttributes(currentPlayer).pas, color: "bg-amber-400" },
                        { lbl: "DEF", val: generateAttributes(currentPlayer).def, color: "bg-indigo-400" },
                        { lbl: "PHY", val: generateAttributes(currentPlayer).phy, color: "bg-purple-400" },
                      ].map((att) => (
                        <div key={att.lbl} className="flex flex-col items-center gap-1.5">
                          <span className="text-[9px] font-black text-slate-500">{att.lbl}</span>
                          <div className="w-3 h-16 bg-[#080c14] rounded-full overflow-hidden flex flex-col justify-end">
                            <div className={`w-full rounded-full ${att.color}`} style={{ height: `${att.val}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-white">{att.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="relative p-4 bg-[#080c14] flex items-center justify-between border-t border-[#1e2d40]">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Value</span>
                     <span className="text-lg font-black text-[#22c55e]">€{(currentPlayer.value/1000000).toFixed(1)}M</span>
                  </div>

                  {/* Swipe Overlays */}
                  <AnimatePresence>
                    {swipeDirection === "left" && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-rose-500/20 z-50 flex items-center justify-center pointer-events-none">
                        <div className="border-4 border-rose-500 text-rose-500 text-4xl font-black uppercase p-2 rounded-xl transform -rotate-12">Pass</div>
                      </motion.div>
                    )}
                    {swipeDirection === "right" && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-emerald-500/20 z-50 flex items-center justify-center pointer-events-none">
                        <div className="border-4 border-emerald-500 text-emerald-500 text-4xl font-black uppercase p-2 rounded-xl transform rotate-12">Sign</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4 px-6">
                   <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                     <Check className="w-8 h-8 text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black text-white">All Caught Up!</h3>
                   <p className="text-sm text-slate-400">You've reviewed all scouted targets for this matchday. Check back tomorrow!</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          {currentPlayer && !swipeDirection && (
            <div className="flex items-center justify-center gap-6 mt-8 w-full max-w-[320px]">
              <button 
                onClick={() => handleSwipe("left")}
                className="w-16 h-16 rounded-full bg-[#0f1623] border border-[#1e2d40] flex items-center justify-center shadow-xl active:scale-90 transition-transform hover:bg-rose-500/10 hover:border-rose-500/50 group"
              >
                <X className="w-8 h-8 text-slate-500 group-hover:text-rose-500 transition-colors" />
              </button>
              <button 
                onClick={() => handleSwipe("right")}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.4)] active:scale-90 transition-transform border-4 border-[#0a0f1e]"
              >
                <Zap className="w-10 h-10 text-slate-950 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SQUAD / SELL PLAYERS */}
      {activeTab === "squad" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 relative z-10 custom-scrollbar">
          <div className="flex justify-between items-center mb-4 px-2">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transfer Budget</span>
               <span className="text-2xl font-black text-white">€{(activeSave.transferBudget / 1000000).toFixed(1)}M</span>
             </div>
          </div>
          <div className="flex flex-col gap-3">
            {squadPlayers.map(p => (
              <div key={p.id} className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-4 flex items-center justify-between shadow-lg">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e2d40] flex items-center justify-center font-black text-white">
                      {p.overall}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{p.position} · €{(p.value/1000000).toFixed(1)}M</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => instantSell(p)}
                   className="px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                 >
                   Sell
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSTANT BID MODAL */}
      <AnimatePresence>
        {bidModalOpen && currentPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f1623] border border-[#1e2d40] rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex flex-col items-center text-center gap-4 border-b border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-[#080c14] flex items-center justify-center text-2xl font-black border border-[#1e2d40]">
                  {currentPlayer.overall}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{currentPlayer.name}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Est. Value: €{(currentPlayer.value/1000000).toFixed(1)}M</p>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                {bidResult ? (
                  <div className="flex flex-col items-center gap-4">
                     <p className={`text-center font-bold text-sm ${bidResult.includes("Accepted") ? "text-emerald-400" : "text-rose-400"}`}>
                       {bidResult}
                     </p>
                     <button onClick={closeBidModal} className="w-full py-4 rounded-xl bg-slate-800 text-white font-black uppercase tracking-widest">
                       Continue
                     </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-center text-sm text-slate-300 font-medium">
                      Making a rapid-fire bid. Our directors will automatically negotiate the best possible deal within your budget.
                    </p>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Your Budget</span>
                      <span className="text-sm font-black text-[#22c55e]">€{(activeSave.transferBudget / 1000000).toFixed(1)}M</span>
                    </div>
                    
                    <button onClick={executeBid} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Confirm Bid
                    </button>
                    <button onClick={closeBidModal} className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
