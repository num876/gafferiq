"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Building, DollarSign, Target, Settings, TrendingUp, AlertTriangle, Users, HardHat, Check, X
} from "lucide-react";
import { motion } from "framer-motion";

export default function BoardAndFinancesPage() {
  const { activeSave, updateActiveSave } = useGame();
  
  const [ticketPrice, setTicketPrice] = useState(activeSave?.ticketPrice || 40);
  const [wageAllocation, setWageAllocation] = useState(activeSave?.wageBudget || 0);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const myPlayers = activeSave.players.filter(p => p.clubId === playerClub.id);
  const currentWages = myPlayers.reduce((sum, p) => sum + p.wage, 0);

  const wageDiff = wageAllocation - activeSave.wageBudget;
  const tempTransferBudget = activeSave.transferBudget - (wageDiff * 50);

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `£${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `£${(val / 1000).toFixed(0)}k`;
    return `£${val}`;
  };

  const saveFinances = () => {
    const newState = { ...activeSave };
    newState.ticketPrice = ticketPrice;
    newState.wageBudget = wageAllocation;
    newState.transferBudget = tempTransferBudget;
    updateActiveSave(newState);
  };

  const expandStadium = () => {
    const cost = 15000000;
    if (tempTransferBudget >= cost) {
      const newState = { ...activeSave };
      const club = newState.clubs.find(c => c.id === playerClub.id)!;
      club.capacity += 5000;
      newState.transferBudget -= cost;
      updateActiveSave(newState);
      setWageAllocation(newState.wageBudget);
    } else {
      alert("Not enough funds in Transfer Budget to expand stadium (£15M required).");
    }
  };

  const confColor = activeSave.boardConfidence >= 70 ? "bg-[#22c55e]" : activeSave.boardConfidence >= 35 ? "bg-[#eab308]" : "bg-[#ef4444]";
  const confText = activeSave.boardConfidence >= 70 ? "text-[#22c55e]" : activeSave.boardConfidence >= 35 ? "text-[#eab308]" : "text-[#ef4444]";
  const projectedMatchdayIncome = playerClub.capacity * ticketPrice * 0.85; // 85% attendance

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Board & Finances</h1>
          <p className="text-slate-400">Manage the club's financial health, stadium infrastructure, and board expectations.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: BOARD CONFIDENCE & OBJECTIVES */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Building className="w-32 h-32" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-400" /> Board Confidence
            </h3>

            <div className="flex flex-col items-center mb-6">
              <span className={`text-5xl font-black mb-2 ${confText}`}>{activeSave.boardConfidence}%</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                {activeSave.boardConfidence >= 70 ? "Secure" : activeSave.boardConfidence >= 35 ? "Under Pressure" : "Insecure"}
              </span>
            </div>

            <div className="w-full h-3 bg-[#1e2d40] rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${activeSave.boardConfidence}%` }}
                className={`h-full ${confColor} shadow-[0_0_15px_currentColor]`}
              />
            </div>
            <p className="text-xs text-slate-500 text-center">If confidence reaches 0%, you will be sacked.</p>
          </div>

          <div className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" /> Season Objectives
            </h3>
            <div className="flex flex-col gap-3">
              {activeSave.boardObjectives?.map((obj, i) => (
                <div key={obj.id} className="p-4 bg-[#0a0f18] rounded-xl border border-[#1e2d40] flex gap-4 items-start">
                  <div className={`mt-0.5 ${obj.status === 'success' ? 'text-green-500' : obj.status === 'failed' ? 'text-red-500' : 'text-blue-400'}`}>
                    {obj.status === 'success' ? <Check className="w-5 h-5" /> : obj.status === 'failed' ? <X className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{obj.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{obj.description}</p>
                  </div>
                </div>
              ))}
              {(!activeSave.boardObjectives || activeSave.boardObjectives.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No specific objectives set.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: FINANCES & BUDGETS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-400" /> Budget Adjustment
            </h3>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-[#0a0f18] rounded-xl p-5 border border-[#1e2d40]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer Budget</p>
                <p className="text-2xl font-black text-white">{formatMoney(tempTransferBudget)}</p>
              </div>
              <div className="bg-[#0a0f18] rounded-xl p-5 border border-[#1e2d40]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wage Budget</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-black text-white">{formatMoney(wageAllocation)}</p>
                  <span className="text-sm text-slate-500 mb-1">/ week</span>
                </div>
              </div>
            </div>

            <div className="mb-6 px-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>More Transfer Funds</span>
                <span>More Wage Funds</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={Math.floor((activeSave.transferBudget + (activeSave.wageBudget * 50)) / 50)} 
                value={wageAllocation}
                onChange={(e) => setWageAllocation(Number(e.target.value))}
                className="w-full h-2 bg-[#1e2d40] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button 
                onClick={saveFinances}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Confirm Budgets
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Matchday Operations
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Ticket Price</span>
                    <span className="font-bold text-white">£{ticketPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={150} 
                    step={5}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full h-2 bg-[#1e2d40] rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <div className="bg-[#0a0f18] p-4 rounded-xl border border-[#1e2d40]">
                  <p className="text-xs text-slate-400 mb-1">Est. Income per Home Game</p>
                  <p className="text-xl font-bold text-green-400">+{formatMoney(projectedMatchdayIncome)}</p>
                </div>
                
                <div className="bg-[#0a0f18] p-4 rounded-xl border border-[#1e2d40]">
                  <p className="text-xs text-slate-400 mb-1">Current Wage Bill</p>
                  <p className={`text-xl font-bold ${currentWages > wageAllocation ? 'text-red-400' : 'text-slate-200'}`}>
                    -{formatMoney(currentWages)} <span className="text-xs text-slate-500">/ week</span>
                  </p>
                </div>

                <button 
                  onClick={saveFinances}
                  className="w-full bg-[#1e2d40] hover:bg-[#2a3f5a] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Apply Prices
                </button>
              </div>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d40] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <HardHat className="w-24 h-24" />
              </div>

              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-slate-400" /> Stadium Infrastructure
              </h3>

              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-1">Current Stadium</p>
                <p className="text-xl font-black text-white">{playerClub.stadium}</p>
              </div>

              <div className="mb-8">
                <p className="text-sm text-slate-400 mb-1">Capacity</p>
                <p className="text-3xl font-black text-white">{playerClub.capacity.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <h4 className="font-bold text-blue-400 text-sm mb-1">Expansion Project</h4>
                <p className="text-xs text-slate-300">Add 5,000 new seats to generate higher matchday revenue.</p>
                <p className="text-sm font-bold text-white mt-2">Cost: £15.0M</p>
              </div>

              <button 
                onClick={expandStadium}
                disabled={tempTransferBudget < 15000000}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <HardHat className="w-4 h-4" /> Fund Expansion
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
