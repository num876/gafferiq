"use client";

import React, { useState, useMemo } from "react";
import { useGame } from "../../../context/GameContext";
import { Player, Club, calculateValue } from "../../../config/seededData";
import { 
  ArrowLeftRight, Search, Sliders, ChevronDown, Check, X, 
  DollarSign, TrendingUp, Sparkles, Plus, Minus, Landmark, Inbox
} from "lucide-react";

export default function Transfers() {
  const { activeSave, updateActiveSave } = useGame();
  
  // State for tabs: "Browse Market" | "Your Squad" | "History"
  const [activeTab, setActiveTab] = useState<"browse" | "squad" | "history">("browse");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [minOvr, setMinOvr] = useState<number>(50);
  const [maxOvr, setMaxOvr] = useState<number>(99);
  const [maxValue, setMaxValue] = useState<number>(180); // In Millions

  // Modal / Interaction states
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0); // In Euros
  const [bidStep, setBidStep] = useState<"bid" | "negotiating" | "contract" | "declined" | "accepted">("bid");
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [suggestedFee, setSuggestedFee] = useState<number>(0);
  
  // Contract offer state
  const [contractYears, setContractYears] = useState<number>(3);
  const [offeredWage, setOfferedWage] = useState<number>(0);
  const [contractMessage, setContractMessage] = useState("");

  // Listing player state
  const [reviewingPlayer, setReviewingPlayer] = useState<Player | null>(null);


  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  
  // Budget calculations
  const totalTransferFunds = activeSave.transferBudget;
  const totalWageFunds = activeSave.wageBudget;

  // Budget reallocation calculations
  // Total pool is transfer budget + wage budget converted to transfer equivalent
  // Ratio: €1/wk wage budget = €50 transfer budget
  const totalPoolTransferEquiv = totalTransferFunds + (totalWageFunds * 50);

  const handleReallocate = () => {
    const nextTransferBudget = Math.floor(totalPoolTransferEquiv * (budgetShiftPercent / 100));
    const remainingPool = totalPoolTransferEquiv - nextTransferBudget;
    const nextWageBudget = Math.floor(remainingPool / 50);

    const newState = {
      ...activeSave,
      transferBudget: nextTransferBudget,
      wageBudget: nextWageBudget,
    };
    newState.gameLog.unshift(`Reallocated budgets: Transfer budget €${(nextTransferBudget/1000000).toFixed(1)}M, Wage limit €${(nextWageBudget/1000).toFixed(0)}k/wk.`);
    updateActiveSave(newState);
    setReallocateSuccess(true);
    setTimeout(() => setReallocateSuccess(false), 2000);
  };

  // Filter players
  const filteredPlayers = useMemo(() => {
    return activeSave.players.filter(p => {
      // Don't show players already at the user's club in browse tab
      if (p.clubId === playerClub.id) return false;

      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = selectedPosition === "ALL" || p.position === selectedPosition;
      
      const playerClubDetails = activeSave.clubs.find(c => c.id === p.clubId);
      const matchesLeague = selectedLeague === "ALL" || (playerClubDetails && playerClubDetails.league === selectedLeague);
      
      const matchesOvr = p.overall >= minOvr && p.overall <= maxOvr;
      const matchesValue = (p.value / 1000000) <= maxValue;

      return matchesSearch && matchesPosition && matchesLeague && matchesOvr && matchesValue;
    });
  }, [activeSave.players, playerClub.id, searchQuery, selectedPosition, selectedLeague, minOvr, maxOvr, maxValue]);

  // Open Bid screen
  const openBidModal = (player: Player) => {
    setSelectedPlayer(player);
    setBidAmount(player.value);
    setBidStep("bid");
    setContractYears(3);
    setOfferedWage(Math.floor(player.wage * 1.1));
    setBidModalOpen(true);
    setNegotiationMessage("");
    setContractMessage("");
  };

  // Submit transfer bid to AI Club
  const submitBid = () => {
    if (!selectedPlayer) return;

    setBidStep("negotiating");
    
    // Simulate thinking delay
    setTimeout(() => {
      const value = selectedPlayer.value;
      const club = activeSave.clubs.find(c => c.id === selectedPlayer.clubId);
      
      // Calculate probability based on bid percentage of player value
      // and club reputation (higher rep club demands premium)
      const premiumFactor = club ? (club.reputation / 80) : 1.0;
      const expectedMinimum = value * 0.95 * premiumFactor;
      
      if (bidAmount < value * 0.8) {
        // Flat rejection
        setBidStep("declined");
        setNegotiationMessage(`${club?.name} has instantly rejected your bid. They refuse to sell ${selectedPlayer.name} for such an insultingly low offer.`);
      } else if (bidAmount < expectedMinimum) {
        // Counter-offer
        const counter = Math.floor(expectedMinimum * (1.05 + Math.random() * 0.1));
        setSuggestedFee(counter);
        setBidStep("bid"); // let user re-bid or accept counter
        setNegotiationMessage(`${club?.name} rejected your bid of €${(bidAmount/1000000).toFixed(2)}M. However, they are open to negotiations and have made a counter-offer of €${(counter/1000000).toFixed(2)}M.`);
      } else {
        // Bid accepted
        setBidStep("contract");
        setNegotiationMessage(`Great news! ${club?.name} has accepted your transfer bid of €${(bidAmount/1000000).toFixed(2)}M. You are now cleared to negotiate personal terms with ${selectedPlayer.name}.`);
      }
    }, 1200);
  };

  // Submit contract terms
  const submitContract = () => {
    if (!selectedPlayer) return;

    if (bidAmount > activeSave.transferBudget) {
      setContractMessage(`Insufficient funds! Your transfer budget is €${(activeSave.transferBudget/1000000).toFixed(2)}M.`);
      return;
    }

    if (offeredWage > activeSave.wageBudget) {
      setContractMessage(`Insufficient wage limit! Your wage limit is €${(activeSave.wageBudget/1000).toFixed(0)}k/week.`);
      return;
    }

    setBidStep("negotiating");

    setTimeout(() => {
      const demandWage = selectedPlayer.wage * (1.0 + (5 - contractYears) * 0.05); // shorter contract -> demands slightly higher wage
      const negotiationSkill = activeSave.manager.attributes.negotiation; // 1-20
      const wageDiscountFactor = 1.0 - (negotiationSkill / 20) * 0.15; // up to 15% discount on player demands

      const acceptableWage = demandWage * wageDiscountFactor;

      if (offeredWage < acceptableWage * 0.9) {
        setBidStep("contract");
        setContractMessage(`${selectedPlayer.name} has rejected your contract proposal. His agent demands a wage closer to €${(acceptableWage/1000).toFixed(0)}k/week.`);
      } else {
        // Contract Signed!
        setBidStep("accepted");
        
        // Execute the transfer
        const currentClub = activeSave.clubs.find(c => c.id === selectedPlayer.clubId)!;
        const newState = { ...activeSave };
        
        // Deduct transfer fee and wage
        newState.transferBudget -= bidAmount;
        newState.wageBudget -= offeredWage;
        
        // Move player
        const statePlayer = newState.players.find(p => p.id === selectedPlayer.id)!;
        statePlayer.clubId = playerClub.id;
        statePlayer.wage = offeredWage;
        statePlayer.contractExpiry = contractYears;
        statePlayer.morale = 95; // Boost morale on joining

        // Add history
        newState.transfersHistory.unshift({
          id: `trans_${Date.now()}`,
          playerName: selectedPlayer.name,
          fromClubName: currentClub.name,
          toClubName: playerClub.name,
          fee: bidAmount,
          type: "permanent",
          matchday: activeSave.currentMatchday
        });

        // Add inbox notification
        newState.inbox.unshift({
          id: `trans_sign_${selectedPlayer.id}`,
          sender: "Chief Scout",
          subject: `NEW SIGNING: ${selectedPlayer.name} Joins!`,
          body: `Deal finalized! ${selectedPlayer.name} has officially signed a ${contractYears}-year contract with our club. The fans are ecstatic. He will be registered and available for matchday selections immediately.`,
          date: `Matchday ${activeSave.currentMatchday}`,
          read: false,
          type: "media"
        });

        newState.gameLog.unshift(`Signed ${selectedPlayer.name} from ${currentClub.name} for €${(bidAmount/1000000).toFixed(1)}M.`);
        updateActiveSave(newState);
      }
    }, 1200);
  };

  // Releasing a player
  const releasePlayer = (player: Player) => {
    // Dynamic Severance Fee: Remaining wage obligations
    const weeksRemaining = player.contractExpiry * 52;
    const severanceFee = player.wage * weeksRemaining;

    if (confirm(`Are you sure you want to terminate ${player.name}'s contract? This will cost €${(severanceFee/1000000).toFixed(2)}M in severance fee.`)) {
      const newState = { ...activeSave };
      if (newState.transferBudget < severanceFee) {
        alert(`Insufficient transfer budget to pay the €${(severanceFee/1000000).toFixed(2)}M termination severance.`);
        return;
      }

      // Deduct fee and remove player
      newState.transferBudget -= severanceFee;
      newState.wageBudget += player.wage;
      const statePlayer = newState.players.find(p => p.id === player.id)!;
      statePlayer.clubId = "free_agent";
      statePlayer.wage = 0;
      statePlayer.contractExpiry = 0;
      statePlayer.isTransferListed = false;

      newState.gameLog.unshift(`Released ${player.name} from contract. Severance €${(severanceFee/1000000).toFixed(2)}M.`);
      
      updateActiveSave(newState);
      alert(`${player.name} has been released from his contract.`);
    }
  };

  // Toggle Transfer List
  const toggleTransferList = (player: Player) => {
    const newState = { ...activeSave };
    const p = newState.players.find(p => p.id === player.id)!;
    p.isTransferListed = !p.isTransferListed;
    if (!p.isTransferListed) p.transferOffers = []; // clear offers if removed
    newState.gameLog.unshift(`${p.name} has been ${p.isTransferListed ? 'added to' : 'removed from'} the transfer list.`);
    updateActiveSave(newState);
  };

  // Accepting AI bid offer
  const acceptOffer = (player: Player, clubId: string, offerFee: number) => {
    const newState = { ...activeSave };
    
    newState.transferBudget += offerFee;
    newState.wageBudget += player.wage;

    const buyerClub = newState.clubs.find(c => c.id === clubId)!;
    const statePlayer = newState.players.find(p => p.id === player.id)!;
    
    statePlayer.clubId = clubId;
    statePlayer.wage = Math.floor(player.wage * 1.1);
    statePlayer.contractExpiry = 3;
    statePlayer.isTransferListed = false;
    statePlayer.transferOffers = [];

    newState.transfersHistory.unshift({
      id: `trans_${Date.now()}`,
      playerName: player.name,
      fromClubName: playerClub.name,
      toClubName: buyerClub.name,
      fee: offerFee,
      type: "permanent",
      matchday: activeSave.currentMatchday
    });

    newState.inbox.unshift({
      id: `trans_sold_${player.id}_${Date.now()}`,
      sender: "Chief Negotiator",
      subject: `TRANSFER OUT: ${player.name} Sold`,
      body: `We have completed the sale of ${player.name} to ${buyerClub.name} for a total fee of €${(offerFee/1000000).toFixed(1)}M. The funds have been deposited in our transfer budget.`,
      date: `Matchday ${activeSave.currentMatchday}`,
      read: false,
      type: "board"
    });

    newState.gameLog.unshift(`Sold ${player.name} to ${buyerClub.name} for €${(offerFee/1000000).toFixed(1)}M.`);
    updateActiveSave(newState);
    setReviewingPlayer(null);
    alert(`${player.name} has been sold successfully.`);
  };

  // Toggle Shortlist
  const toggleShortlist = (playerId: string) => {
    const isShortlisted = activeSave.scoutShortlist.includes(playerId);
    const newState = { ...activeSave };
    if (isShortlisted) {
      newState.scoutShortlist = newState.scoutShortlist.filter(id => id !== playerId);
    } else {
      newState.scoutShortlist.push(playerId);
    }
    updateActiveSave(newState);
  };

  const shortlistLookup = useMemo(() => new Set(activeSave.scoutShortlist), [activeSave.scoutShortlist]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-green-500" />
            Transfer Centre
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse the player transfer database, negotiate deals, sell squad members, or balance budgets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase border ${
            activeSave.transferWindowOpen 
              ? 'bg-green-600/10 text-green-400 border-green-500/20' 
              : 'bg-rose-600/10 text-rose-400 border-rose-500/20'
          }`}>
            Transfer Window: {activeSave.transferWindowOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 text-xs font-bold text-slate-400">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-3 border-b-2 transition ${activeTab === "browse" ? "border-green-500 text-slate-100" : "border-transparent hover:text-slate-200"}`}
        >
          Browse Market
        </button>
        <button
          onClick={() => setActiveTab("squad")}
          className={`px-4 py-3 border-b-2 transition ${activeTab === "squad" ? "border-green-500 text-slate-100" : "border-transparent hover:text-slate-200"}`}
        >
          Sell Players ({activeSave.players.filter(p => p.clubId === playerClub.id).length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 border-b-2 transition ${activeTab === "history" ? "border-green-500 text-slate-100" : "border-transparent hover:text-slate-200"}`}
        >
          Transfer Logs ({activeSave.transfersHistory.length})
        </button>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Search Filters or Reallocate Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {activeTab === "browse" ? (
            <div className="glass-card p-5 rounded-xl flex flex-col gap-4 text-xs">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Sliders className="w-4 h-4 text-green-500" />
                Market Filters
              </h3>

              {/* Text Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Search Player</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Mbappé..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-green-500 text-xs font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Position Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Position</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-green-500 text-xs font-bold"
                >
                  <option value="ALL">All Positions</option>
                  <option value="GK">GK - Goalkeepers</option>
                  <option value="DEF">DEF - Defenders</option>
                  <option value="MID">MID - Midfielders</option>
                  <option value="ATT">ATT - Attackers</option>
                </select>
              </div>

              {/* League Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">League</label>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-green-500 text-xs font-bold"
                >
                  <option value="ALL">All Leagues</option>
                  <option value="EPL">English Premier League</option>
                  <option value="La Liga">La Liga</option>
                  <option value="Serie A">Serie A</option>
                  <option value="Bundesliga">Bundesliga</option>
                  <option value="Ligue 1">Ligue 1</option>
                </select>
              </div>

              {/* OVR Range */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Overall (OVR)</label>
                  <span className="text-[10px] font-bold text-green-400">{minOvr} - {maxOvr}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={minOvr}
                    onChange={(e) => setMinOvr(parseInt(e.target.value))}
                    className="w-1/2 accent-green-600 h-1 bg-slate-950 rounded-lg"
                  />
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={maxOvr}
                    onChange={(e) => setMaxOvr(parseInt(e.target.value))}
                    className="w-1/2 accent-green-600 h-1 bg-slate-950 rounded-lg"
                  />
                </div>
              </div>

              {/* Max Value */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Max Value</label>
                  <span className="text-[10px] font-bold text-green-400">€{maxValue}M</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={maxValue}
                  onChange={(e) => setMaxValue(parseInt(e.target.value))}
                  className="w-full accent-green-600 h-1 bg-slate-950 rounded-lg"
                />
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPosition("ALL");
                  setSelectedLeague("ALL");
                  setMinOvr(50);
                  setMaxOvr(99);
                  setMaxValue(180);
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 py-2 rounded-lg font-bold text-[11px] text-slate-400 hover:text-white transition"
              >
                Reset Filters
              </button>
            </div>
          ) : null}

          {/* Reallocate Budget card */}
          <div className="glass-card p-5 rounded-xl flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Landmark className="w-4 h-4 text-green-500" />
              Adjust Finance Boards
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Slide to adjust allocation between transfer fees and weekly wage limit.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between font-bold text-[10px] text-slate-400">
                <span>Transfer Budget</span>
                <span>Wage Limit</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={budgetShiftPercent}
                onChange={(e) => setBudgetShiftPercent(parseInt(e.target.value))}
                className="w-full accent-green-600 h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between font-bold text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                <div>
                  <span className="text-[9px] block text-slate-500 uppercase">Transfer</span>
                  <span className="text-green-400 font-extrabold">€{( (totalPoolTransferEquiv * budgetShiftPercent / 100) / 1000000 ).toFixed(1)}M</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] block text-slate-500 uppercase">Wage /wk</span>
                  <span className="text-slate-200 font-extrabold">€{( (totalPoolTransferEquiv * (100 - budgetShiftPercent) / 100 / 50) / 1000 ).toFixed(0)}k</span>
                </div>
              </div>
              
              <button
                onClick={handleReallocate}
                className="w-full bg-green-600 hover:bg-green-500 py-2.5 rounded-lg font-bold text-[11px] text-white shadow shadow-green-600/10 transition"
              >
                Confirm Reallocation
              </button>
              
              {reallocateSuccess && (
                <span className="text-[10px] text-center font-bold text-green-400 bg-green-500/10 border border-green-500/25 py-1 rounded animate-pulse">
                  Reallocation Saved!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-3">
          {activeTab === "browse" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                Available Players ({filteredPlayers.length})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                {filteredPlayers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-semibold">
                    No players found matching current filters.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Club</th>
                        <th className="py-3 px-4">Age / Position</th>
                        <th className="py-3 px-4">Value</th>
                        <th className="py-3 px-4">Wage</th>
                        <th className="py-3 px-4 text-center">Shortlist</th>
                        <th className="py-3 px-4 text-right">OVR</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredPlayers.map(player => {
                        const club = activeSave.clubs.find(c => c.id === player.clubId);
                        const isShortlisted = shortlistLookup.has(player.id);
                        return (
                          <tr key={player.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-200">
                              {player.name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-semibold">
                              {club ? club.shortName : "Free Agent"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">
                              {player.age} yrs • <span className="font-bold text-green-500">{player.position}</span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-green-400">
                              €{(player.value / 1000000).toFixed(1)}M
                            </td>
                            <td className="py-3.5 px-4 text-slate-450">
                              €{(player.wage / 1000).toFixed(0)}k/wk
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button 
                                onClick={() => toggleShortlist(player.id)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${isShortlisted ? 'bg-amber-600/10 text-amber-400 border border-amber-650/20' : 'bg-slate-950 text-slate-500 hover:text-slate-300'}`}
                              >
                                {isShortlisted ? "Listed" : "Shortlist"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-slate-200 text-sm">{player.overall}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => openBidModal(player)}
                                disabled={!activeSave.transferWindowOpen}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase shadow transition ${
                                  activeSave.transferWindowOpen
                                    ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 active:scale-95'
                                    : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                                }`}
                              >
                                Bid
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "squad" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                Sell or Release Squad Members
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Age / Position</th>
                      <th className="py-3 px-4">Est Value</th>
                      <th className="py-3 px-4">Current Wage</th>
                      <th className="py-3 px-4">Contract Expiry</th>
                      <th className="py-3 px-4 text-right">OVR</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {activeSave.players.filter(p => p.clubId === playerClub.id).map(player => (
                      <tr key={player.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-200">{player.name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{player.age} yrs • <span className="font-bold text-green-500">{player.position}</span></td>
                        <td className="py-3.5 px-4 font-black text-green-400">€{(player.value / 1000000).toFixed(1)}M</td>
                        <td className="py-3.5 px-4 text-slate-450">€{(player.wage / 1000).toFixed(0)}k/wk</td>
                        <td className="py-3.5 px-4 text-slate-400">{player.contractExpiry} Years</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-200 text-sm">{player.overall}</td>
                        <td className="py-3.5 px-4 text-right flex flex-col justify-end gap-2 items-end">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleTransferList(player)}
                              className={`${player.isTransferListed ? 'bg-amber-950/20 hover:bg-amber-950 border-amber-500/20 text-amber-500' : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-350 hover:text-white'} border px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition`}
                            >
                              {player.isTransferListed ? 'Listed' : 'Transfer List'}
                            </button>
                            <button
                              onClick={() => releasePlayer(player)}
                              className="bg-rose-950/20 hover:bg-rose-950 border border-rose-500/20 text-rose-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition"
                            >
                              Release
                            </button>
                          </div>
                          {player.transferOffers && player.transferOffers.length > 0 && (
                            <button
                              onClick={() => setReviewingPlayer(player)}
                              className="bg-green-600 hover:bg-green-500 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition animate-pulse"
                            >
                              Review {player.transferOffers.length} {player.transferOffers.length === 1 ? 'Bid' : 'Bids'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                Recent Signings & Sales
              </h3>

              <div className="flex flex-col gap-3">
                {activeSave.transfersHistory.length === 0 ? (
                  <div className="glass-card p-6 text-center text-slate-500 font-bold rounded-xl text-xs">
                    No transfers have occurred in this save file yet.
                  </div>
                ) : (
                  activeSave.transfersHistory.map((log) => (
                    <div 
                      key={log.id}
                      className="glass-card p-4 rounded-xl flex items-center justify-between border-slate-850 hover:border-slate-800 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-950/40 border border-green-500/20 flex items-center justify-center text-green-500 shadow">
                          <ArrowLeftRight className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-100">{log.playerName}</h4>
                          <p className="text-[11px] text-slate-450 mt-1">
                            <span className="font-semibold text-slate-350">{log.fromClubName}</span>
                            <span className="mx-1.5">➔</span>
                            <span className="font-semibold text-green-400">{log.toClubName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-green-400 block">€{(log.fee/1000000).toFixed(1)}M</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">Matchday {log.matchday}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Bids Modal */}
      {reviewingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative border-slate-800">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-3">
              <Inbox className="w-5 h-5 text-green-500" />
              Transfer Bids Received
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Review active transfer offers for <span className="font-bold text-white">{reviewingPlayer.name}</span>. Market value: €{(reviewingPlayer.value/1000000).toFixed(1)}M
            </p>

            <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {reviewingPlayer.transferOffers?.map((offer, idx) => {
                const buyerClub = activeSave.clubs.find(c => c.id === offer.clubId);
                return (
                  <div key={idx} className="bg-slate-950/80 rounded-xl border border-slate-850 p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">From: {buyerClub?.name}</span>
                      <span className="font-black text-green-400 text-sm">€{(offer.amount/1000000).toFixed(2)}M</span>
                    </div>
                    <button
                      onClick={() => acceptOffer(reviewingPlayer, offer.clubId, offer.amount)}
                      className="mt-2 py-2 bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-green-500 hover:text-white font-bold text-xs rounded-lg transition"
                    >
                      Accept This Offer
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 font-bold text-xs">
              <button
                onClick={() => setReviewingPlayer(null)}
                className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation & Bid Modal */}
      {bidModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col relative border-slate-800">
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Transfer Negotiation</h3>
                <p className="text-[11px] text-slate-400 mt-1">Negotiating terms with {selectedPlayer.name} and his club.</p>
              </div>
              <button
                onClick={() => setBidModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-slate-350 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Negotiation stages */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[400px] flex flex-col gap-6">
              {bidStep === "bid" && (
                <div className="flex flex-col gap-6 text-xs">
                  {negotiationMessage && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 leading-relaxed font-medium">
                      {negotiationMessage}
                    </div>
                  )}

                  {/* Player details mini card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-sm">{selectedPlayer.name}</h4>
                      <span className="text-[10px] text-slate-450 font-bold block mt-1 uppercase">OVR {selectedPlayer.overall} • {selectedPlayer.position}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Market Value</span>
                      <span className="font-black text-green-400 text-base">€{(selectedPlayer.value/1000000).toFixed(1)}M</span>
                    </div>
                  </div>

                  {/* Input Bid Fee */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-450 uppercase text-[10px]">Your Offer Bid:</span>
                      <span className="text-green-400 font-extrabold text-sm">€{(bidAmount/1000000).toFixed(2)}M</span>
                    </div>

                    <input
                      type="range"
                      min={Math.floor(selectedPlayer.value * 0.5)}
                      max={Math.floor(selectedPlayer.value * 2)}
                      step={Math.floor(selectedPlayer.value * 0.05) || 500000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseInt(e.target.value))}
                      className="w-full accent-green-600 h-1.5 bg-slate-950 rounded-lg"
                    />
                    
                    <div className="flex justify-between gap-2">
                      <button 
                        onClick={() => setBidAmount(Math.floor(selectedPlayer.value * 0.8))}
                        className="bg-slate-950 border border-slate-900 rounded py-1 px-2.5 text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Low (80%)
                      </button>
                      <button 
                        onClick={() => setBidAmount(selectedPlayer.value)}
                        className="bg-slate-950 border border-slate-900 rounded py-1 px-2.5 text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Market Value (100%)
                      </button>
                      <button 
                        onClick={() => setBidAmount(Math.floor(selectedPlayer.value * 1.2))}
                        className="bg-slate-950 border border-slate-900 rounded py-1 px-2.5 text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Premium (120%)
                      </button>
                      {suggestedFee > 0 && (
                        <button 
                          onClick={() => setBidAmount(suggestedFee)}
                          className="bg-green-600/10 border border-green-500/20 text-green-400 rounded py-1 px-2.5 text-[10px]"
                        >
                          Match Demand ({(suggestedFee/1000000).toFixed(1)}M)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-lg hover:bg-slate-850 hover:text-white transition"
                    >
                      Walk Away
                    </button>
                    <button
                      onClick={submitBid}
                      className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition shadow shadow-green-600/10"
                    >
                      Submit Transfer Offer
                    </button>
                  </div>
                </div>
              )}

              {bidStep === "negotiating" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-green-600/20 border-t-green-500 animate-spin"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Contacting Representatives...</span>
                </div>
              )}

              {bidStep === "declined" && (
                <div className="flex flex-col gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 leading-relaxed font-medium">
                    {negotiationMessage}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-lg hover:bg-slate-850 hover:text-white transition"
                    >
                      Close Centre
                    </button>
                  </div>
                </div>
              )}

              {bidStep === "contract" && (
                <div className="flex flex-col gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 leading-relaxed font-medium">
                    {negotiationMessage}
                  </div>

                  {contractMessage && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 leading-relaxed font-medium">
                      {contractMessage}
                    </div>
                  )}

                  {/* Contract proposal inputs */}
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                    Propose Personal Terms
                  </h4>

                  {/* Offered wage weekly */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Offered Weekly Wage:</span>
                      <span className="text-green-400 font-extrabold">€{(offeredWage/1000).toFixed(0)}k/week</span>
                    </div>
                    <input
                      type="range"
                      min={Math.floor(selectedPlayer.wage * 0.7)}
                      max={Math.floor(selectedPlayer.wage * 2.5)}
                      step={1000}
                      value={offeredWage}
                      onChange={(e) => setOfferedWage(parseInt(e.target.value))}
                      className="w-full accent-green-600 h-1 bg-slate-950 rounded-lg"
                    />
                    <span className="text-[9px] text-slate-500">Player's current wage: €{(selectedPlayer.wage/1000).toFixed(0)}k/wk. Negotiating skill will affect acceptance.</span>
                  </div>

                  {/* Contract duration */}
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-slate-400">Contract Length:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(yr => (
                        <button
                          key={yr}
                          onClick={() => setContractYears(yr)}
                          className={`flex-1 py-2 rounded-lg font-bold border transition ${contractYears === yr ? 'bg-green-600 border-green-500 text-white shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                        >
                          {yr} {yr === 1 ? "Year" : "Years"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-lg hover:bg-slate-850 hover:text-white transition"
                    >
                      Walk Away
                    </button>
                    <button
                      onClick={submitContract}
                      className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition shadow shadow-green-600/10"
                    >
                      Offer Contract Terms
                    </button>
                  </div>
                </div>
              )}

              {bidStep === "accepted" && (
                <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-600/10 border border-green-500/25 flex items-center justify-center text-green-500 shadow shadow-green-600/10">
                    <Check className="w-8 h-8" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-base font-black text-white">Transfer Completed!</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-1">
                      {selectedPlayer.name} has signed the papers and is now a member of your squad. The transfer fee of €{(bidAmount/1000000).toFixed(2)}M has been paid.
                    </p>
                  </div>

                  <button
                    onClick={() => setBidModalOpen(false)}
                    className="px-6 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition mt-4"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
