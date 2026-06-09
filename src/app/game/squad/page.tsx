/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Users, UserCheck, Heart, CircleDot, Award, Coins, Calendar, X, BarChart2 
} from "lucide-react";
import { Player } from "../../../config/seededData";

export default function Squad() {
  const { activeSave, updateActiveSave } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewalNotif, setRenewalNotif] = useState("");
  const [proposedWage, setProposedWage] = useState(0);
  const [proposedYears, setProposedYears] = useState(3);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id && !p.isAcademy);

  // Group squad by position
  const positionsOrder = ["GK", "DEF", "MID", "ATT"] as const;
  const groupedSquad = {
    GK: squad.filter(p => p.position === "GK"),
    DEF: squad.filter(p => p.position === "DEF"),
    MID: squad.filter(p => p.position === "MID"),
    ATT: squad.filter(p => p.position === "ATT")
  };

  // Manager Scouting level affects potential reveal accuracy
  const scoutingAttr = activeSave.manager.attributes.scouting;
  
  const getPotentialRevealText = (potential: number) => {
    if (scoutingAttr >= 15) {
      return `${potential}`;
    } else if (scoutingAttr >= 10) {
      const min = Math.max(50, potential - 3);
      const max = Math.min(99, potential + 3);
      return `${min} - ${max} (Approx)`;
    } else {
      const min = Math.max(50, potential - 6);
      const max = Math.min(99, potential + 6);
      return `${min} - ${max} (Low Scouting detail)`;
    }
  };

  const handleRenewContract = () => {
    if (!selectedPlayer || !activeSave) return;
    
    const wageIncrease = proposedWage - selectedPlayer.wage;

    if (wageIncrease > 0 && activeSave.wageBudget < wageIncrease) {
      setRenewalNotif(`Insufficient Wage Budget. You need €${(wageIncrease/1000).toFixed(0)}k more to renew this contract.`);
      return;
    }

    // Evaluate proposal (Basic logic: if wage offered is >= their overall-based expectation)
    const expectedWage = Math.floor((selectedPlayer.overall / 60) * 8000);
    if (proposedWage < expectedWage * 0.9) {
      setRenewalNotif(`Player rejected the offer. Demands at least €${(expectedWage/1000).toFixed(0)}k.`);
      return;
    }

    // Process renewal
    const updatedPlayers = activeSave.players.map(p => {
      if (p.id === selectedPlayer.id) {
        return { ...p, wage: proposedWage, contractExpiry: p.contractExpiry + proposedYears, morale: Math.min(100, p.morale + 10) };
      }
      return p;
    });

    updateActiveSave({
      ...activeSave,
      players: updatedPlayers,
      wageBudget: activeSave.wageBudget - Math.max(0, wageIncrease),
      gameLog: [`Renewed ${selectedPlayer.name}'s contract for ${proposedYears} years at €${(proposedWage/1000).toFixed(0)}k/week.`, ...activeSave.gameLog]
    });

    setSelectedPlayer({ ...selectedPlayer, wage: proposedWage, contractExpiry: selectedPlayer.contractExpiry + proposedYears, morale: Math.min(100, selectedPlayer.morale + 10) });
    setRenewalNotif(`Contract Renewed successfully for ${proposedYears} years!`);
    setTimeout(() => setIsRenewing(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            First Team Squad
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review rosters, attributes, and seasonal statistics of {playerClub.name}.
          </p>
        </div>
      </div>

      {/* Squad Lists Grouped by Position */}
      <div className="flex flex-col gap-8">
        {positionsOrder.map(pos => {
          const players = groupedSquad[pos];
          if (players.length === 0) return null;

          return (
            <div key={pos} className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-green-500 pl-2">
                {pos === "GK" ? "Goalkeepers" : pos === "DEF" ? "Defenders" : pos === "MID" ? "Midfielders" : "Attackers"}
              </h3>
              
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Age</th>
                      <th className="py-3 px-4">Nation</th>
                      <th className="py-3 px-4">Wage</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">Morale</th>
                      <th className="py-3 px-4 text-center">Form</th>
                      <th className="py-3 px-4 text-right">OVR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {players.map(player => (
                      <tr 
                        key={player.id} 
                        onClick={() => setSelectedPlayer(player)}
                        className="hover:bg-slate-900/80 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {player.name}
                          {player.injuryStatus === "Injured" && (
                            <span className="ml-2 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded font-extrabold uppercase">Injured</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{player.age}</td>
                        <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{player.nationalityFlag}</span>
                          <span className="truncate max-w-[100px]">{player.nationality}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">€{(player.wage / 1000).toFixed(0)}k/wk</td>
                        <td className="py-3 px-4 text-green-400 font-bold">€{(player.value / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${player.morale >= 75 ? 'text-green-400' : player.morale >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {player.morale}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 justify-center">
                            {(() => {
                              const history = player.ratingHistory || [];
                              const recent = history.slice(-5);
                              const dots = [];
                              for (let i = 0; i < 5; i++) {
                                const rating = recent[i];
                                let color = "text-slate-700"; // default grey
                                if (rating !== undefined) {
                                  if (rating >= 8.0) color = "text-green-500";
                                  else if (rating >= 6.0) color = "text-amber-500";
                                  else color = "text-rose-500";
                                }
                                dots.push(<CircleDot key={i} className={`w-3.5 h-3.5 fill-current ${color}`} />);
                              }
                              return dots;
                            })()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-green-400 text-sm">{player.overall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
            {/* Close Button */}
            <button 
              onClick={() => { setSelectedPlayer(null); setIsRenewing(false); setRenewalNotif(""); }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header details */}
            <div className="p-6 bg-slate-900 border-b border-slate-850 flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl text-slate-100 shadow-md"
                style={{ backgroundColor: playerClub.primaryColor }}
              >
                {selectedPlayer.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white truncate">{selectedPlayer.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold shrink-0">
                    Ovr {selectedPlayer.overall}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Age {selectedPlayer.age}</span>
                  <span>•</span>
                  <span>{selectedPlayer.nationalityFlag} {selectedPlayer.nationality}</span>
                  <span>•</span>
                  <span className="text-slate-500">Contract Expiry: {selectedPlayer.contractExpiry} yrs</span>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[400px]">
              
              {/* Left Column: Attributes */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-green-500" />
                  Player Attributes
                </h4>
                
                <div className="flex flex-col gap-3">
                  {[
                    { key: "pace" as const, label: "Pace" },
                    { key: "shooting" as const, label: "Shooting" },
                    { key: "passing" as const, label: "Passing" },
                    { key: "dribbling" as const, label: "Dribbling" },
                    { key: "defending" as const, label: "Defending" },
                    { key: "physical" as const, label: "Physical" },
                    { key: "mental" as const, label: "Mental" },
                    { key: "stamina" as const, label: "Stamina" }
                  ].map(attr => {
                    const val = selectedPlayer[attr.key];
                    return (
                      <div key={attr.key} className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">{attr.label}</span>
                          <span className="font-extrabold text-slate-200">{val}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${val >= 80 ? 'bg-green-500' : val >= 65 ? 'bg-amber-500' : 'bg-slate-700'}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Career stats, Contracts, Value */}
              <div className="flex flex-col gap-6">
                {/* Stats & Potential Card */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col gap-3 text-xs">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5">Career Dashboard</h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Scout Potential:</span>
                    <span className="font-bold text-green-400">
                      {getPotentialRevealText(selectedPlayer.potential)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Season Goals:</span>
                    <span className="font-bold text-slate-200">{selectedPlayer.goals || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Season Assists:</span>
                    <span className="font-bold text-slate-200">{selectedPlayer.assists || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Personality Trait:</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-green-500" />
                      {selectedPlayer.personality}
                    </span>
                  </div>
                </div>

                {/* Financial details */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col gap-3 text-xs">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5">Financial & Happiness</h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Market Value:</span>
                    <span className="font-bold text-green-400">€{(selectedPlayer.value / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Weekly Wage:</span>
                    <span className="font-bold text-slate-200">€{(selectedPlayer.wage / 1000).toFixed(0)}k/week</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Morale:</span>
                    <span className={`font-bold uppercase ${selectedPlayer.morale >= 75 ? 'text-green-400' : selectedPlayer.morale >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {selectedPlayer.morale >= 75 ? 'Very Happy' : selectedPlayer.morale >= 45 ? 'Okay' : 'Unhappy'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/60 border-t border-slate-850 flex flex-col gap-3">
              {renewalNotif && (
                <div className="text-xs font-bold text-center p-2 rounded bg-slate-800 text-green-400">
                  {renewalNotif}
                </div>
              )}
              {isRenewing ? (
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mt-2">
                  <h4 className="text-sm font-bold text-slate-200 mb-2">Contract Negotiation</h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Proposed Wage (€/week)</label>
                      <input 
                        type="number" 
                        value={proposedWage} 
                        onChange={(e) => setProposedWage(Number(e.target.value))}
                        className="w-full bg-slate-800 text-white rounded p-2 text-sm border border-slate-700" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Contract Extension (Years)</label>
                      <input 
                        type="number" 
                        min="1" max="5" 
                        value={proposedYears} 
                        onChange={(e) => setProposedYears(Number(e.target.value))}
                        className="w-full bg-slate-800 text-white rounded p-2 text-sm border border-slate-700" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleRenewContract} className="flex-1 px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition">Submit Offer</button>
                    <button onClick={() => setIsRenewing(false)} className="flex-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center w-full gap-2 border-b border-slate-800 pb-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const newState = { ...activeSave };
                          const p = newState.players.find(p => p.id === selectedPlayer.id)!;
                          const wCount = (p.stats?.form || []).filter((f: string) => f === "W").length;
                          if (wCount >= 2) {
                            p.morale = Math.min(100, p.morale + 10);
                            newState.gameLog.unshift(`Praised ${p.name}'s good form. Morale increased.`);
                            setRenewalNotif(`Praised ${p.name}. Morale increased to ${p.morale}%`);
                          } else {
                            p.morale = Math.max(0, p.morale - 10);
                            newState.gameLog.unshift(`Praised ${p.name}'s poor form. The player felt patronized. Morale dropped.`);
                            setRenewalNotif(`Praised ${p.name}. The player felt patronized. Morale dropped to ${p.morale}%`);
                          }
                          updateActiveSave(newState);
                          setSelectedPlayer({...selectedPlayer, morale: p.morale});
                        }}
                        className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/40 text-emerald-500 hover:text-white font-bold text-[10px] uppercase transition"
                      >
                        Praise Player
                      </button>
                      <button 
                        onClick={() => {
                          const newState = { ...activeSave };
                          const p = newState.players.find(p => p.id === selectedPlayer.id)!;
                          const wCount = (p.stats?.form || []).filter((f: string) => f === "W").length;
                          if (wCount <= 2) {
                            p.morale = Math.min(100, p.morale + 5);
                            newState.gameLog.unshift(`Criticized ${p.name}'s poor form. He appreciated the tough love. Morale slightly increased.`);
                            setRenewalNotif(`Criticized ${p.name}. Morale increased to ${p.morale}%`);
                          } else {
                            p.morale = Math.max(0, p.morale - 15);
                            newState.gameLog.unshift(`Criticized ${p.name}'s good form. He felt unfairly targeted. Morale dropped.`);
                            setRenewalNotif(`Criticized ${p.name}. Morale dropped to ${p.morale}%`);
                          }
                          updateActiveSave(newState);
                          setSelectedPlayer({...selectedPlayer, morale: p.morale});
                        }}
                        className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-600/40 text-rose-500 hover:text-white font-bold text-[10px] uppercase transition"
                      >
                        Criticize Form
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-500/20 transition">
                        <input 
                          type="checkbox" 
                          checked={selectedPlayer.isTransferListed || false} 
                          onChange={(e) => {
                            const isListed = e.target.checked;
                            const newState = { ...activeSave };
                            const p = newState.players.find(p => p.id === selectedPlayer.id)!;
                            p.isTransferListed = isListed;
                            newState.gameLog.unshift(`${p.name} has been ${isListed ? 'added to' : 'removed from'} the transfer list.`);
                            updateActiveSave(newState);
                            setSelectedPlayer({...selectedPlayer, isTransferListed: isListed});
                          }}
                          className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        Transfer List
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center w-full gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { 
                          setProposedWage(selectedPlayer.wage); 
                          setProposedYears(3); 
                          setIsRenewing(true); 
                          setRenewalNotif(""); 
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 border border-amber-600/40 text-amber-500 hover:text-white font-bold text-xs transition"
                      >
                        Renew Contract
                      </button>
                      {selectedPlayer.age <= 23 && !selectedPlayer.onLoanFrom && (
                        <button 
                          onClick={() => {
                            const newState = { ...activeSave };
                            const p = newState.players.find(p => p.id === selectedPlayer.id)!;
                            p.isLoanListed = !p.isLoanListed;
                            newState.gameLog.unshift(`${p.name} has been ${p.isLoanListed ? 'added to' : 'removed from'} the loan list.`);
                            updateActiveSave(newState);
                            setSelectedPlayer({...selectedPlayer, isLoanListed: p.isLoanListed});
                            setRenewalNotif(p.isLoanListed ? "Player added to loan list." : "Player removed from loan list.");
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 text-blue-500 hover:text-white font-bold text-xs transition"
                        >
                          {selectedPlayer.isLoanListed ? "Remove from Loan List" : "List for Loan"}
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => { setSelectedPlayer(null); setIsRenewing(false); setRenewalNotif(""); }}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white shadow transition"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
