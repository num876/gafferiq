/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Calendar, CheckCircle, ChevronLeft, ChevronRight, BarChart2, Info 
} from "lucide-react";
import { LEAGUE_INFO, Club } from "../../../config/seededData";
import { MatchFixture } from "../../../db/storage";

export default function Fixtures() {
  const { activeSave } = useGame();
  const [selectedMatchday, setSelectedMatchday] = useState<number>(activeSave?.currentMatchday || 1);
  const [selectedFixture, setSelectedFixture] = useState<MatchFixture | null>(null);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const league = LEAGUE_INFO[playerClub.league];

  const isEplOrLaLigaOrSerieA = ["EPL", "La Liga", "Serie A"].includes(playerClub.league);
  
  const isCupMatchday = activeSave.fixtures.some(f => f.league === playerClub.league && f.matchday === selectedMatchday && f.competition === "Domestic Cup");
  const cupRoundName = activeSave.fixtures.find(f => f.league === playerClub.league && f.matchday === selectedMatchday && f.competition === "Domestic Cup")?.round || "";
  const maxMatchdays = isEplOrLaLigaOrSerieA ? 38 : 34;

  // Filter fixtures by league and matchday
  const matchdayFixtures = activeSave.fixtures.filter(
    f => f.league === playerClub.league && f.matchday === selectedMatchday
  );

  const getClubName = (clubId: string) => {
    return activeSave.clubs.find(c => c.id === clubId)?.name || "Unknown";
  };

  const getClubLogo = (clubId: string) => {
    return activeSave.clubs.find(c => c.id === clubId)?.name.charAt(0).toUpperCase() || "?";
  };

  const handlePrevMatchday = () => {
    setSelectedMatchday(prev => Math.max(1, prev - 1));
    setSelectedFixture(null);
  };

  const handleNextMatchday = () => {
    setSelectedMatchday(prev => Math.min(maxMatchdays, prev + 1));
    setSelectedFixture(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Matchday Controller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Season Fixtures
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse matchday results and upcoming fixtures for the {league.name}.
          </p>
        </div>

        {/* Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button 
            onClick={handlePrevMatchday}
            disabled={selectedMatchday === 1}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-4 text-xs font-bold text-slate-200 min-w-[100px] text-center flex flex-col">
            {isCupMatchday ? <span className="text-amber-400">Domestic Cup - {cupRoundName}</span> : <span>Matchday {selectedMatchday} / {maxMatchdays}</span>}
          </span>

          <button 
            onClick={handleNextMatchday}
            disabled={selectedMatchday === maxMatchdays}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Fixture list + Match Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Fixtures Roster (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {matchdayFixtures.map(fixture => {
            const isPlayerClubHome = fixture.homeClubId === playerClub.id;
            const isPlayerClubAway = fixture.awayClubId === playerClub.id;
            const isPlayerMatch = isPlayerClubHome || isPlayerClubAway;

            return (
              <button
                key={fixture.id}
                onClick={() => fixture.played && setSelectedFixture(fixture)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition ${isPlayerMatch ? 'bg-green-600/5 border-green-500/35 hover:bg-green-600/10' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'} ${selectedFixture?.id === fixture.id ? 'ring-1 ring-green-500' : ''}`}
                disabled={!fixture.played}
              >
                {/* Team logos & names comparison */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  {/* Home */}
                  <div className="flex items-center gap-2.5 min-w-0 w-[42%] justify-end text-right">
                    <span className="text-xs font-bold text-slate-200 truncate">{getClubName(fixture.homeClubId)}</span>
                    <div className="w-7 h-7 rounded bg-slate-800 text-[10px] font-black text-slate-100 flex items-center justify-center shrink-0">
                      {getClubLogo(fixture.homeClubId)}
                    </div>
                  </div>

                  {/* Scoreline or VS */}
                  <div className="text-center w-[16%] flex justify-center shrink-0">
                    {fixture.played ? (
                      <span className="px-2 py-0.5 rounded bg-slate-950 font-black text-xs text-green-400 border border-slate-850">
                        {fixture.homeScore} - {fixture.awayScore}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">VS</span>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-2.5 min-w-0 w-[42%] justify-start text-left">
                    <div className="w-7 h-7 rounded bg-slate-800 text-[10px] font-black text-slate-100 flex items-center justify-center shrink-0">
                      {getClubLogo(fixture.awayClubId)}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate">{getClubName(fixture.awayClubId)}</span>
                  </div>
                </div>

                {/* Arrow hint indicator */}
                {fixture.played && (
                  <Info className="w-4 h-4 text-slate-500 shrink-0 ml-3" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Match Details Pane (5 cols) */}
        <div className="lg:col-span-5">
          {selectedFixture ? (
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 shadow-xl animate-fade-in max-h-[500px] overflow-y-auto">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200">Match summary report</h3>
                <p className="text-[10px] text-slate-500 mt-1">Matchday {selectedFixture.matchday} results</p>
              </div>

              {/* Score visual panel */}
              <div className="flex items-center justify-around py-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <div className="text-center w-20">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold mx-auto text-slate-200">
                    {getClubLogo(selectedFixture.homeClubId)}
                  </div>
                  <span className="text-[9px] font-bold block mt-1 text-slate-400 truncate">{getClubName(selectedFixture.homeClubId).split(" ").pop()}</span>
                </div>

                <span className="text-lg font-black text-green-400">{selectedFixture.homeScore} - {selectedFixture.awayScore}</span>

                <div className="text-center w-20">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold mx-auto text-slate-200">
                    {getClubLogo(selectedFixture.awayClubId)}
                  </div>
                  <span className="text-[9px] font-bold block mt-1 text-slate-400 truncate">{getClubName(selectedFixture.awayClubId).split(" ").pop()}</span>
                </div>
              </div>

              {/* Match Events timeline */}
              {selectedFixture.events && selectedFixture.events.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[9px] border-b border-slate-900 pb-1">Match Timeline Events</h4>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedFixture.events.map((ev, i) => (
                      <div key={i} className="text-[10px] text-slate-400 flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-850">
                        <span className="font-extrabold text-green-400">{ev.minute}'</span>
                        <div>
                          <span className="font-bold text-slate-200">{ev.type}: {ev.playerName}</span>
                          <p className="text-slate-500 mt-0.5 leading-normal">{ev.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">No events log recorded for this CPU sim match.</p>
              )}

              {/* Tactical Analysis snippet if available */}
              {selectedFixture.tacticalAnalysis && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 text-[10px] leading-relaxed text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1 uppercase tracking-wider text-[9px]">Tactical Analyst Verdict:</span>
                  {selectedFixture.tacticalAnalysis}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl text-center text-slate-500 py-16 gap-2 flex flex-col justify-center items-center">
              <Calendar className="w-8 h-8 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-400">Select a Played Match</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] leading-normal">Click any scoreline block from the left roster to view the events timeline and analysis report.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
