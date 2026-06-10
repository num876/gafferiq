// src/app/game/manager-career/page.tsx
"use client";

import React from "react";
import { useGame } from "../../../context/GameContext";
import { User } from "lucide-react";

export default function ManagerCareerPage() {
  const { activeSave, updateActiveSave, exitToMainMenu } = useGame();

  if (!activeSave) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">
        Loading career data...
      </div>
    );
  }

  const { manager, jobOffers } = activeSave;

  const applyOffer = (offer: { clubId: string; clubName: string; requiredReputation: number }) => {
    // Update selected club
    const newSave = { ...activeSave, selectedClubId: offer.clubId, jobOffers: [] };
    // Add inbox notification
    newSave.inbox.unshift({
      id: `job_accept_${Date.now()}`,
      sender: "Career Agent",
      subject: `Accepted offer from ${offer.clubName}`,
      body: `You have accepted the job offer from ${offer.clubName}. Your contract has been updated.`,
      date: `Matchday ${newSave.currentMatchday}`,
      read: false,
      type: "board",
    });
    updateActiveSave(newSave);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080c14] text-slate-100">
      {/* Header */}
      <header className="bg-[#0a0f1e] border-b border-[#1e2d40] px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5" /> Manager Career
        </h1>
        <button
          onClick={() => {
            exitToMainMenu();
            // navigate to home (router could be used but keep simple)
          }}
          className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition"
        >
          Exit
        </button>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {/* Skill Tree */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Skill Tree</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(manager.skills).map(([cat, skill]) => (
              <div
                key={cat}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/40 transition"
              >
                <h3 className="text-lg font-medium text-white mb-2">{cat}</h3>
                <p className="text-sm text-slate-300 mb-2">
                  Level: {skill.level} / 5
                </p>
                <div className="w-full h-2 bg-white/20 rounded-full mb-2">
                  <div
                    className="h-full bg-[#22c55e] rounded-full"
                    style={{ width: `${(skill.points / 100) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400">
                  {skill.points} / 100 points to next level
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Offers */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Job Market</h2>
          {jobOffers.length === 0 ? (
            <p className="text-slate-400">No job offers at the moment. Improve your reputation to attract interest.</p>
          ) : (
            <ul className="space-y-4">
              {jobOffers.map((offer, idx) => (
                <li
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{offer.clubName}</p>
                    <p className="text-sm text-slate-300">Requires Reputation: {offer.requiredReputation}</p>
                  </div>
                  <button
                    onClick={() => applyOffer(offer)}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-sm transition"
                  >
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
