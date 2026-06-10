"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { Player } from "../../../config/seededData";
import { ChevronRight, DollarSign, RefreshCw, ShoppingCart, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreSeasonAuction() {
  const router = useRouter();
  const { activeSave, updateActiveSave } = useGame();
  
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [marketPool, setMarketPool] = useState<Player[]>([]);
  
  // Guard
  useEffect(() => {
    if (!activeSave) {
      router.push("/onboarding/manager");
    }
  }, [activeSave, router]);

  useEffect(() => {
    if (activeSave && marketPool.length === 0) {
      // Generate a pool of 50 available players from other clubs
      const otherPlayers = activeSave.players.filter(p => p.clubId !== activeSave.selectedClubId && p.overall > 60);
      // Shuffle
      const shuffled = [...otherPlayers].sort(() => 0.5 - Math.random());
      setMarketPool(shuffled.slice(0, 50));
    }
  }, [activeSave, marketPool.length]);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const mySquad = activeSave.players.filter(p => p.clubId === playerClub.id).sort((a,b) => b.overall - a.overall);

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    return `€${(val / 1000).toFixed(0)}K`;
  };

  const handleSell = (player: Player) => {
    const updatedPlayers = activeSave.players.map(p => {
      if (p.id === player.id) {
        return { ...p, clubId: "free_agent" };
      }
      return p;
    });

    const updatedClubs = activeSave.clubs.map(c => {
      if (c.id === playerClub.id) {
        return { ...c, transferBudget: c.transferBudget + player.value };
      }
      return c;
    });

    updateActiveSave({
      ...activeSave,
      players: updatedPlayers,
      clubs: updatedClubs
    });
  };

  const handleBuy = (player: Player) => {
    if (playerClub.transferBudget < player.value) {
      alert("Not enough transfer budget!");
      return;
    }

    const sourceClub = activeSave.clubs.find(c => c.id === player.clubId);
    if (sourceClub) {
      const repDifference = sourceClub.reputation - playerClub.reputation;
      // Reject if player is high rated and coming from a much bigger club
      if (repDifference >= 5 && player.overall >= 80) {
        alert(`${player.name} rejected your offer! They consider joining ${playerClub.name} a step down in their career from ${sourceClub.name}.`);
        setMarketPool(prev => prev.filter(p => p.id !== player.id));
        return;
      }
    }

    const updatedPlayers = activeSave.players.map(p => {
      if (p.id === player.id) {
        return { ...p, clubId: playerClub.id };
      }
      return p;
    });

    const updatedClubs = activeSave.clubs.map(c => {
      if (c.id === playerClub.id) {
        return { ...c, transferBudget: c.transferBudget - player.value };
      }
      return c;
    });

    updateActiveSave({
      ...activeSave,
      players: updatedPlayers,
      clubs: updatedClubs
    });

    // Remove from market pool
    setMarketPool(prev => prev.filter(p => p.id !== player.id));
  };

  const handleStartSeason = () => {
    router.push("/game/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col py-8 px-6 lg:px-24">
      {/* Top Banner */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl gap-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-sky-400" />
            Pre-Season Transfer Market
          </h1>
          <p className="text-slate-400 text-sm mt-1">Shape your squad before the season officially begins.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-950/50 p-4 rounded-xl border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Available Funds</span>
            <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {formatMoney(playerClub.transferBudget)}
            </span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Squad Size</span>
            <span className="text-xl font-black text-white flex items-center gap-1">
              <Users className="w-5 h-5 text-sky-400" />
              {mySquad.length}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col mt-8 flex-1">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab("buy")}
            className={`flex-1 py-3 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all border ${activeTab === "buy" ? "bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"}`}
          >
            Sign Players
          </button>
          <button 
            onClick={() => setActiveTab("sell")}
            className={`flex-1 py-3 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all border ${activeTab === "sell" ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"}`}
          >
            Sell Players
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {activeTab === "buy" ? (
                marketPool.map((player) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    key={player.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center font-black text-lg text-slate-400 border border-white/5">
                        {player.overall}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{player.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                          <span className="flex items-center gap-1">{player.nationalityFlag} {player.nationality}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className={
                            player.position === "ATT" ? "text-rose-400" : 
                            player.position === "MID" ? "text-emerald-400" : 
                            player.position === "DEF" ? "text-sky-400" : "text-amber-400"
                          }>{player.position}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>Age {player.age}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleBuy(player)}
                      disabled={playerClub.transferBudget < player.value}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {formatMoney(player.value)}
                    </button>
                  </motion.div>
                ))
              ) : (
                mySquad.map((player) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 50 }}
                    key={player.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center font-black text-lg text-slate-400 border border-white/5">
                        {player.overall}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{player.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                          <span className="flex items-center gap-1">{player.nationalityFlag} {player.nationality}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className={
                            player.position === "ATT" ? "text-rose-400" : 
                            player.position === "MID" ? "text-emerald-400" : 
                            player.position === "DEF" ? "text-sky-400" : "text-amber-400"
                          }>{player.position}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>Age {player.age}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSell(player)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Sell for {formatMoney(player.value)}
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            
            {activeTab === "buy" && marketPool.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-bold">No more players available in this window.</div>
            )}
            {activeTab === "sell" && mySquad.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-bold">Your squad is completely empty!</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleStartSeason}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(52,211,153,0.3)] transition transform hover:-translate-y-1"
          >
            <CheckCircle2 className="w-5 h-5" />
            Start Season
          </button>
        </div>
      </div>
    </div>
  );
}
