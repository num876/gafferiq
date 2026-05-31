"use client";

import React from "react";
import { useGame } from "../../../context/GameContext";
import { 
  User, Award, Trophy, Target, PieChart, Activity, Flag, 
  BookOpen, Medal, ChevronRight, CheckCircle 
} from "lucide-react";

export default function ManagerProfile() {
  const { activeSave } = useGame();

  if (!activeSave) return null;

  const { manager } = activeSave;
  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;

  const totalMatches = manager.winCount + manager.drawCount + manager.lossCount;
  const winRate = totalMatches > 0 ? ((manager.winCount / totalMatches) * 100).toFixed(1) : "0.0";

  const allAchievements = [
    { id: "First Win", desc: "Win your first match." },
    { id: "First Title", desc: "Win a league title." },
    { id: "Giant Killer", desc: "Defeat a club with much higher reputation." },
    { id: "Invincible", desc: "Go a full season undefeated." },
    { id: "Financial Genius", desc: "Accumulate a large transfer budget." }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-green-500" />
            Manager Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review your career statistics, attributes, and unlocked achievements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: ID Card & Attributes */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* ID Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-850 flex flex-col items-center text-center gap-4 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-900/20 to-transparent"></div>
            
            <div className="w-24 h-24 rounded-full bg-slate-850 border-4 border-slate-900 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 mt-2">
              <svg viewBox="0 0 100 100" className="w-20 h-20 mt-3">
                <path d="M20,90 Q50,70 80,90 Z" fill={manager.avatar.shirtColor} />
                <circle cx="50" cy="50" r="22" fill={manager.avatar.skinTone} />
                <path d="M30,45 Q50,30 70,45" fill={manager.avatar.hairColor} strokeWidth="1.5" />
                <circle cx="44" cy="48" r="2" fill="#1e293b" />
                <circle cx="56" cy="48" r="2" fill="#1e293b" />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-black text-white">{manager.firstName} {manager.lastName}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Manager of {playerClub.name}
              </p>
            </div>

            <div className="w-full flex justify-center gap-6 text-[10px] font-bold text-slate-400 border-t border-slate-850 pt-4 mt-2">
              <div className="flex flex-col items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-500" />
                <span>{manager.nationality}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Born {manager.dob}</span>
              </div>
            </div>
          </div>

          {/* Manager Attributes Radar */}
          <div className="glass-card p-6 rounded-2xl border border-slate-850 flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-2 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-green-500" />
              Manager Attributes
            </h4>

            <div className="flex flex-col gap-3">
              {[
                { label: "Tactical Knowledge", val: manager.attributes.tacticalKnowledge },
                { label: "Man Management", val: manager.attributes.manManagement },
                { label: "Motivation", val: manager.attributes.motivation },
                { label: "Scouting", val: manager.attributes.scouting },
                { label: "Negotiation", val: manager.attributes.negotiation }
              ].map(attr => (
                <div key={attr.label} className="flex flex-col gap-1.5 text-[10px] font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase">{attr.label}</span>
                    <span className="text-slate-200">{attr.val}/20</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${attr.val >= 15 ? 'bg-green-500' : attr.val >= 10 ? 'bg-amber-500' : 'bg-slate-700'}`}
                      style={{ width: `${(attr.val / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Career Stats, Style, Achievements */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Tactical Philosophy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-850 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tactical Style</span>
                <span className="text-sm font-black text-slate-100">{manager.playingStyle}</span>
                <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{manager.bio}</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-850 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Reputation</span>
                <span className="text-sm font-black text-slate-100">{manager.reputationLabel}</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex-1">
                    <div className="h-full bg-amber-500" style={{ width: `${manager.reputation}%` }} />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-400 shrink-0">{manager.reputation}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Records */}
          <div className="glass-card p-6 rounded-2xl border border-slate-850">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 flex items-center gap-2 mb-5">
              <PieChart className="w-3.5 h-3.5 text-green-500" />
              Career Record Overview
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Matches Played</span>
                <span className="text-2xl font-black text-slate-100">{totalMatches}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Win Rate</span>
                <span className="text-2xl font-black text-green-400">{winRate}%</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Goals Scored</span>
                <span className="text-2xl font-black text-blue-400">{manager.goalsScored}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Trophies</span>
                <span className="text-2xl font-black text-amber-400">{manager.titlesWon}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex h-4 rounded-full overflow-hidden bg-slate-950 border border-slate-900">
                <div className="bg-green-500 h-full" style={{ width: `${totalMatches ? (manager.winCount / totalMatches) * 100 : 0}%` }}></div>
                <div className="bg-slate-500 h-full" style={{ width: `${totalMatches ? (manager.drawCount / totalMatches) * 100 : 0}%` }}></div>
                <div className="bg-rose-500 h-full" style={{ width: `${totalMatches ? (manager.lossCount / totalMatches) * 100 : 0}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-wider">
                <span className="text-green-500">{manager.winCount} Wins</span>
                <span className="text-slate-500">{manager.drawCount} Draws</span>
                <span className="text-rose-500">{manager.lossCount} Losses</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-6 rounded-2xl border border-slate-850">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-850 pb-3 flex items-center gap-2 mb-5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Trophy Cabinet & Achievements
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allAchievements.map(achv => {
                const isUnlocked = manager.achievements.includes(achv.id);
                return (
                  <div 
                    key={achv.id} 
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${isUnlocked ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-950 border-slate-900 text-slate-600'}`}
                  >
                    <Medal className={`w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-700'}`} />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>{achv.id}</span>
                      <span className={`text-[10px] ${isUnlocked ? 'text-amber-500/70' : 'text-slate-600'}`}>{achv.desc}</span>
                    </div>
                    {isUnlocked && <CheckCircle className="w-4 h-4 ml-auto text-amber-500 opacity-50" />}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
