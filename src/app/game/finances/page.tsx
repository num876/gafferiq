"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";

import { motion } from "framer-motion";

export default function FinancesPage() {
  const { activeSave, updateActiveSave } = useGame();
  const [activeTab, setActiveTab] = useState<"overview" | "budgets" | "stadium" | "sponsors">("overview");

  // Local state for sliders
  const [ticketPrice, setTicketPrice] = useState(40);
  const [transferBudget, setTransferBudget] = useState(0);
  const [wageBudget, setWageBudget] = useState(0);

  // New sponsor state
  const [availableSponsors, setAvailableSponsors] = useState<any[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);

  useEffect(() => {
    if (activeSave) {
      setTicketPrice(activeSave.ticketPrice || 40);
      setTransferBudget(activeSave.transferBudget || 0);
      setWageBudget(activeSave.wageBudget || 0);
    }
  }, [activeSave]);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const bankBalance = activeSave.bankBalance || 0;

  // Overview Tab Data
  const clubPlayers = activeSave.players.filter(p => p.clubId === playerClub.id);
  const currentWages = clubPlayers.reduce((sum, p) => sum + p.wage, 0);
  const scoutWages = (activeSave.scouts || []).reduce((sum, s) => sum + s.wage, 0);
  const totalWages = currentWages + scoutWages;

  let sponsorIncome = 0;
  if (playerClub.sponsorships) {
    sponsorIncome = playerClub.sponsorships.reduce((sum, s) => sum + s.valuePerWeek, 0);
  }

  const weeklyExpenses = totalWages + 25000; // Base ops
  const projectedProfit = sponsorIncome - weeklyExpenses; // Without matchday

  // Handlers
  const handleSaveBudgets = () => {
    // Basic logic: You can trade transfer budget for wage budget
    // 1 wage budget = 50 transfer budget (roughly 1 year of wages = 52 weeks, but typical FM conversion is around 1:52)
    // We'll just save it to activeSave
    updateActiveSave({
      ...activeSave,
      transferBudget,
      wageBudget
    });
  };

  const handleUpdateTicketPrice = (val: number) => {
    setTicketPrice(val);
    updateActiveSave({
      ...activeSave,
      ticketPrice: val
    });
  };

  const handleUpgradeStadium = () => {
    if (bankBalance < 5000000) return; // Costs 5M for 5000 seats
    updateActiveSave({
      ...activeSave,
      bankBalance: activeSave.bankBalance - 5000000,
      stadiumExpansion: {
        targetMatchday: activeSave.currentMatchday + 10,
        capacityIncrease: 5000
      }
    });
  };

  const generateSponsors = async () => {
    setLoadingSponsors(true);
    try {
      const res = await fetch("/api/ai/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubName: playerClub.name,
          reputation: playerClub.reputation
        })
      });
      const data = await res.json();
      setAvailableSponsors(data.sponsors || []);
      setLoadingSponsors(false);
    } catch (e) {
      console.error(e);
      setLoadingSponsors(false);
    }
  };

  const signSponsor = (sponsor: any) => {
    const updatedClubs = activeSave.clubs.map(c => {
      if (c.id === playerClub.id) {
        return {
          ...c,
          sponsorships: [...(c.sponsorships || []), sponsor]
        };
      }
      return c;
    });

    updateActiveSave({
      ...activeSave,
      clubs: updatedClubs
    });
    setAvailableSponsors(availableSponsors.filter(s => s.id !== sponsor.id));
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Club Finances</h1>
          <p className="text-slate-400">Manage budgets, sponsorships, and stadium infrastructure.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-4 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-400">Bank Balance</span>
            <span className={`text-2xl font-bold \${bankBalance >= 0 ? "text-emerald-400" : "text-red-500"}`}>
              €{bankBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-800">
        {["overview", "budgets", "stadium", "sponsors"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 \${
              activeTab === tab
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white mb-6">Weekly Projection</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Sponsorship Income</span>
                  <span className="text-emerald-400">+€{sponsorIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Player Wages</span>
                  <span className="text-red-400">-€{currentWages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Staff & Operations</span>
                  <span className="text-red-400">-€{(scoutWages + 25000).toLocaleString()}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-white">Projected Weekly Profit</span>
                  <span className={`font-bold \${projectedProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {projectedProfit >= 0 ? "+" : ""}€{projectedProfit.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">* Matchday ticket sales not included in projection</p>
              </div>
            </div>
            
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white mb-6">Board Budgets</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Transfer Budget</span>
                    <span className="text-white font-semibold">€{(activeSave.transferBudget || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Wage Budget</span>
                    <span className="text-white font-semibold">€{(activeSave.wageBudget || 0).toLocaleString()} / w</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full \${totalWages > (activeSave.wageBudget || 1) ? 'bg-red-500' : 'bg-blue-500'}`} 
                      style={{ width: `\${Math.min(100, (totalWages / Math.max(1, activeSave.wageBudget)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-500">Currently spending</span>
                    <span className={totalWages > activeSave.wageBudget ? "text-red-400" : "text-slate-400"}>
                      €{totalWages.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "stadium" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">{playerClub.stadium}</h3>
                  <p className="text-slate-400 mt-1">Capacity: {playerClub.capacity.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Condition</div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `\${playerClub.stadiumCondition || 100}%` }} />
                    </div>
                    <span className="text-white font-bold">{Math.round(playerClub.stadiumCondition || 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <h4 className="text-white font-semibold mb-4">Ticket Pricing</h4>
                  <div className="flex items-center gap-6">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-2xl font-bold text-emerald-400 w-20">€{ticketPrice}</span>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-slate-400">Cheaper tickets = Higher Attendance</span>
                    <span className="text-slate-400">Expensive tickets = More Revenue/Fan</span>
                  </div>
                  <button onClick={() => handleUpdateTicketPrice(ticketPrice)} className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium">
                    Apply Price
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Expansion & Maintenance</h3>
              
              {activeSave.stadiumExpansion ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center flex-1 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-emerald-400 font-bold mb-1">Under Construction</h4>
                  <p className="text-sm text-slate-400 mb-4">Adding {activeSave.stadiumExpansion.capacityIncrease.toLocaleString()} seats.</p>
                  <p className="text-xs font-semibold text-emerald-500">Completes MD {activeSave.stadiumExpansion.targetMatchday}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-slate-400 mb-6">Invest your bank balance into expanding the stadium to increase maximum matchday revenue.</p>
                  
                  <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Cost</span>
                      <span className="text-red-400 font-semibold">€5,000,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Capacity</span>
                      <span className="text-emerald-400 font-semibold">+5,000 seats</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-300">Duration</span>
                      <span className="text-slate-400">10 Matchdays</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpgradeStadium}
                    disabled={bankBalance < 5000000}
                    className="w-full mt-auto py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
                  >
                    Authorize Expansion
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "sponsors" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Active Partnerships</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {playerClub.sponsorships && playerClub.sponsorships.length > 0 ? (
                  playerClub.sponsorships.map(sponsor => (
                    <div key={sponsor.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">{sponsor.type} Sponsor</div>
                      <h4 className="text-2xl font-bold text-white mb-4">{sponsor.name}</h4>
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Value</span>
                          <span className="text-white font-bold">€{sponsor.valuePerWeek.toLocaleString()}/wk</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Remaining</span>
                          <span className="text-white font-bold">{sponsor.remainingWeeks} weeks</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                    <p className="text-slate-400">No active sponsorships. Find partners to increase your revenue.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Commercial Opportunities</h3>
                <button 
                  onClick={generateSponsors} 
                  disabled={loadingSponsors}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {loadingSponsors ? "Negotiating..." : "Find Sponsors"}
                </button>
              </div>

              {availableSponsors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSponsors.map(sponsor => (
                    <div key={sponsor.id} className="bg-slate-900/80 border border-indigo-500/30 p-6 rounded-2xl flex flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">{sponsor.type} Deal</div>
                      <h4 className="text-xl font-bold text-white mb-4">{sponsor.name}</h4>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Offer</span>
                          <span className="text-emerald-400 font-bold">€{sponsor.valuePerWeek.toLocaleString()}/wk</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Duration</span>
                          <span className="text-slate-300 font-bold">{sponsor.remainingWeeks} weeks</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => signSponsor(sponsor)}
                        className="w-full mt-auto py-2 bg-slate-800 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Sign Contract
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "budgets" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Budget Adjustment</h3>
            <p className="text-sm text-slate-400 mb-8">Reallocate your funds between the transfer budget and the wage budget. Conversion rate is roughly 1:50.</p>
            
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Transfer Budget</div>
                  <div className="text-2xl font-bold text-white">€{transferBudget.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Wage Budget</div>
                  <div className="text-2xl font-bold text-emerald-400">€{wageBudget.toLocaleString()} /w</div>
                </div>
              </div>

              <input 
                type="range" 
                min="0" 
                max={transferBudget + (wageBudget * 50)} 
                value={transferBudget}
                onChange={(e) => {
                  const newT = parseInt(e.target.value);
                  const total = transferBudget + (wageBudget * 50);
                  const newW = Math.floor((total - newT) / 50);
                  setTransferBudget(newT);
                  setWageBudget(newW);
                }}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <button 
                onClick={handleSaveBudgets}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
              >
                Confirm Changes
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
