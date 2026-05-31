"use client";

import React from "react";
import Link from "next/link";
import { useGame } from "../context/GameContext";
import { Play, Trash2, Calendar, Trophy, Shield, Users, Compass, Cpu } from "lucide-react";
import { LEAGUE_INFO } from "../config/seededData";

export default function WelcomePage() {
  const { savesList, loadSave, deleteGame } = useGame();

  const getClubLogoPlaceholder = (clubName: string) => {
    return clubName.charAt(0).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col justify-between py-12 px-6 lg:px-24">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-lg shadow-green-600/30">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">
            Gaffer<span className="text-green-500">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        {/* Left: Branding & Feature Promo */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold tracking-wide text-green-400 w-fit">
            <Trophy className="w-3.5 h-3.5" />
            Voted Next-Gen Football Sim
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Take Control of the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
              Tactical Pitch
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Manage real squads, draft tactics on an interactive board, scout wonderkids, and watch your lineups play in a highly detailed simulation engine powered by AI.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-4 max-w-xl">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="p-2 rounded bg-green-500/10 text-green-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Real Squads</h4>
                <p className="text-xs text-slate-400">96 real clubs & rosters from 5 leagues</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="p-2 rounded bg-green-500/10 text-green-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">AI Match Engine</h4>
                <p className="text-xs text-slate-400">Tactical simulation with live commentary</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="p-2 rounded bg-green-500/10 text-green-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Detailed Tactics</h4>
                <p className="text-xs text-slate-400">Formations, roles, set piece takers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="p-2 rounded bg-green-500/10 text-green-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Scout Network</h4>
                <p className="text-xs text-slate-400">Search markets & unlock player potentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Save Manager */}
        <div className="lg:col-span-5 w-full flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
              Career Saves
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 font-semibold text-slate-400">
                {savesList.length} saves
              </span>
            </h2>

            {/* Saves List */}
            <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {savesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="p-4 rounded-full bg-slate-800 text-slate-500">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">No active saves found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Create a new career slot to start your managerial journey.</p>
                  </div>
                </div>
              ) : (
                savesList.map((save) => {
                  const playerClub = save.clubs.find(c => c.id === save.selectedClubId)!;
                  const league = LEAGUE_INFO[playerClub.league];

                  return (
                    <div 
                      key={save.id}
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-slate-100 shadow-md"
                          style={{ 
                            backgroundColor: playerClub.primaryColor,
                            color: playerClub.secondaryColor === "#ffffff" ? "#0f172a" : playerClub.secondaryColor 
                          }}
                        >
                          {getClubLogoPlaceholder(playerClub.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-green-400 transition">
                            {save.saveName}
                          </h4>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{playerClub.name}</span>
                            <span className="text-slate-600">•</span>
                            <span 
                              className="text-xs font-semibold px-1 rounded-sm flex items-center gap-0.5"
                              style={{ color: league.color }}
                            >
                              {league.emoji} {playerClub.league}
                            </span>
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              Season {save.currentSeason}, Matchday {save.currentMatchday}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link 
                          href="/game/dashboard"
                          onClick={() => loadSave(save.id)}
                          className="p-2 rounded bg-green-600 hover:bg-green-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Load
                        </Link>
                        <button 
                          onClick={() => deleteGame(save.id)}
                          className="p-2 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition"
                          title="Delete Save"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create New Save CTA */}
            <Link 
              href="/onboarding/manager"
              className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 transition-all text-center"
            >
              <Trophy className="w-4 h-4" />
              Start New Career
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto w-full text-center border-t border-slate-900 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© 2026 GafferIQ Simulation Engine. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400 transition">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
        </div>
      </div>
    </main>
  );
}
