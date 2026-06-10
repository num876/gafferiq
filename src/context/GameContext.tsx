"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SaveState, Manager, loadAllSaves, saveGame, deleteSave as dbDeleteSave, createNewSave as dbCreateNewSave, MatchFixture, Standing, generateCupFixturesForRound, getRegionForLeague, addManagerSkillPoints, checkPromotionEligibility } from "../db/storage";
import { simulateMatchHeuristic, autoSelectLineup, TacticalInstructions } from "../engine/simulator";
import { Player, Club, calculateValue } from "../config/seededData";
import { generateWeeklyNews } from "../engine/newsGenerator";

interface GameContextType {
  activeSave: SaveState | null;
  savesList: SaveState[];
  loading: boolean;
  loadSave: (id: string) => void;
  createNewGame: (saveName: string, manager: Manager, clubId: string, speed: "Quick Sim" | "Detailed Sim") => void;
  deleteGame: (id: string) => void;
  updateActiveSave: (state: SaveState) => void;
  playMatchdayCpuGames: () => void;
  completeLiveMatch: (fixtureId: string, result: Partial<MatchFixture>) => void;
  advanceToNextMatchday: () => void;
  exitToMainMenu: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [activeSave, setActiveSave] = useState<SaveState | null>(null);
  const [savesList, setSavesList] = useState<SaveState[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saves on mount
  useEffect(() => {
    refreshSaves();
    // Check if there is an active save in sessionStorage to restore after page reload
    const storedActiveId = sessionStorage.getItem("gaffer_iq_active_save_id");
    if (storedActiveId) {
      loadAllSaves().then(list => {
        const found = list.find(s => s.id === storedActiveId);
        if (found) {
          setActiveSave(found);
        }
      });
    }
    setLoading(false);
  }, []);

  const refreshSaves = () => {
    loadAllSaves().then(list => setSavesList(list));
  };

  const loadSave = (id: string) => {
    loadAllSaves().then(list => {
      let found = list.find(s => s.id === id);
      if (found) {
        if (found.lastActiveTimestamp) {
          const now = Date.now();
          const msPassed = now - found.lastActiveTimestamp;
          const hoursPassed = msPassed / (1000 * 60 * 60);
          
          if (hoursPassed >= 1) {
            const idleIncome = Math.floor(hoursPassed * 150000); // 150k per hour
            
            found.bankBalance += idleIncome;
            found.inbox.unshift({
              id: `idle_${Date.now()}`,
              sender: "Club Secretary",
              subject: "While you were away...",
              body: `Welcome back, boss. While you were away for ${Math.floor(hoursPassed)} hours, the club generated €${(idleIncome/1000).toFixed(0)}k in commercial revenue, and the squad completed their scheduled training sessions.`,
              date: "Just Now",
              read: false,
              type: "board"
            });

            if (typeof Notification !== "undefined" && Notification.permission === 'granted') {
              new Notification('GafferIQ', { body: `Your club earned €${(idleIncome/1000000).toFixed(1)}M while you were away!` });
            }
          }
        }
        
        found.lastActiveTimestamp = Date.now();
        setActiveSave(found);
        sessionStorage.setItem("gaffer_iq_active_save_id", id);
      }
    });
  };

  const createNewGame = (saveName: string, manager: Manager, clubId: string, speed: "Quick Sim" | "Detailed Sim") => {
    const newSave = dbCreateNewSave(saveName, manager, clubId, speed);
    newSave.lastActiveTimestamp = Date.now();
    saveGame(newSave);
    setActiveSave(newSave);
    sessionStorage.setItem("gaffer_iq_active_save_id", newSave.id);
    refreshSaves();
  };

  const deleteGame = (id: string) => {
    dbDeleteSave(id);
    if (activeSave?.id === id) {
      setActiveSave(null);
      sessionStorage.removeItem("gaffer_iq_active_save_id");
    }
    refreshSaves();
  };

  const updateActiveSave = (state: SaveState) => {
    state.lastActiveTimestamp = Date.now();
    setActiveSave(state);
    saveGame(state);
    refreshSaves();
  };

  const exitToMainMenu = () => {
    setActiveSave(null);
    sessionStorage.removeItem("gaffer_iq_active_save_id");
  };

  const completeLiveMatch = (fixtureId: string, result: Partial<MatchFixture>) => {
    if (!activeSave) return;
    const state = { ...activeSave };
    const fixture = state.fixtures.find(f => f.id === fixtureId);
    if (!fixture) return;

    const homeClub = state.clubs.find(c => c.id === fixture.homeClubId)!;
    const awayClub = state.clubs.find(c => c.id === fixture.awayClubId)!;
    const homeSquad = state.players.filter(p => p.clubId === homeClub.id);
    const awaySquad = state.players.filter(p => p.clubId === awayClub.id);

    fixture.homeScore = result.homeScore ?? fixture.homeScore;
    fixture.awayScore = result.awayScore ?? fixture.awayScore;
    fixture.played = true;
    fixture.events = result.events ?? [];
    fixture.stats = result.stats ?? fixture.stats;
    fixture.playerRatings = result.playerRatings ?? {};
    fixture.motmId = result.motmId ?? "";
    fixture.tacticalAnalysis = result.tacticalAnalysis ?? "";
    fixture.pressQuote = result.pressQuote ?? "";

    updatePlayerStatsFromFixture(state, fixture, homeSquad, awaySquad);
    updateManagerStatsFromFixture(state, fixture);
    updateActiveSave(state);
  };

  // Simulates all matches on the current matchday for other teams
  const playMatchdayCpuGames = () => {
    if (!activeSave) return;

    const state = { ...activeSave };
    const mDay = state.currentMatchday;
    const playerClubId = state.selectedClubId;

    // Find all fixtures of this matchday
    const fixturesToSim = state.fixtures.filter(f => f.matchday === mDay && !f.played);

    fixturesToSim.forEach(fixture => {
      const isPlayerMatch = fixture.homeClubId === playerClubId || fixture.awayClubId === playerClubId;
      if (isPlayerMatch && fixture.played) {
        // Player already played and saved it
        return;
      }
      
      if (isPlayerMatch && !fixture.played) {
        // Fallback quick-sim for player match in case they skipped
        const homeClub = state.clubs.find(c => c.id === fixture.homeClubId)!;
        const awayClub = state.clubs.find(c => c.id === fixture.awayClubId)!;
        const homeSquad = state.players.filter(p => p.clubId === homeClub.id);
        const awaySquad = state.players.filter(p => p.clubId === awayClub.id);

        const result = simulateMatchHeuristic(
          fixture,
          homeClub,
          awayClub,
          homeSquad,
          awaySquad,
          isPlayerMatch && fixture.homeClubId === playerClubId && state.tactics ? state.tactics.instructions : DEFAULT_TACTICS_MOCK(),
          isPlayerMatch && fixture.awayClubId === playerClubId && state.tactics ? state.tactics.instructions : DEFAULT_TACTICS_MOCK()
        );

        fixture.homeScore = result.homeScore;
        fixture.awayScore = result.awayScore;
        fixture.played = true;
        fixture.events = result.events as any;
        fixture.stats = result.stats;
        fixture.playerRatings = result.playerRatings;
        fixture.motmId = result.motmId;
        fixture.tacticalAnalysis = result.tacticalAnalysis;
        fixture.pressQuote = result.pressQuote;

        // Update player & manager stats for this game
        updatePlayerStatsFromFixture(state, fixture, homeSquad, awaySquad);
        updateManagerStatsFromFixture(state, fixture);
        return;
      }

      // CPU matches
      const homeClub = state.clubs.find(c => c.id === fixture.homeClubId)!;
      const awayClub = state.clubs.find(c => c.id === fixture.awayClubId)!;
      const homeSquad = state.players.filter(p => p.clubId === homeClub.id);
      const awaySquad = state.players.filter(p => p.clubId === awayClub.id);

      const result = simulateMatchHeuristic(
        fixture,
        homeClub,
        awayClub,
        homeSquad,
        awaySquad,
        DEFAULT_TACTICS_MOCK(),
        DEFAULT_TACTICS_MOCK()
      );

      fixture.homeScore = result.homeScore;
      fixture.awayScore = result.awayScore;
      fixture.played = true;
      fixture.events = result.events as any;
      fixture.stats = result.stats;
      fixture.playerRatings = result.playerRatings;
      fixture.motmId = result.motmId;
      
      updatePlayerStatsFromFixture(state, fixture, homeSquad, awaySquad);
    });

    // Recompute standings for this matchday
    rebuildStandings(state);

    updateActiveSave(state);
  };

  // Advances game logic to the next matchday
  const advanceToNextMatchday = () => {
    if (!activeSave) return;

    let state = { ...activeSave };
    
    // Ensure current matchday CPU games are simmed
    const fixturesToSim = state.fixtures.filter(f => f.matchday === state.currentMatchday && !f.played);
    if (fixturesToSim.length > 0) {
      playMatchdayCpuGames();
      // Reload state after sim
      state = { ...activeSave };
    }

    // Cup Progression Logic
    const cupPlayedFixtures = state.fixtures.filter(f => f.matchday === state.currentMatchday && f.competition === "Domestic Cup" && f.played);
    if (cupPlayedFixtures.length > 0 && state.cupState) {
      const playerClubId = state.selectedClubId;
      const playerClub = state.clubs.find(c => c.id === playerClubId)!;
      
      let playerEliminated = false;
      let playerAdvanced = false;

      cupPlayedFixtures.forEach(f => {
        const winner = (f.homeScore! > f.awayScore!) ? f.homeClubId : f.awayClubId;
        const loser = (f.homeScore! > f.awayScore!) ? f.awayClubId : f.homeClubId;
        
        state.cupState!.activeClubs = state.cupState!.activeClubs.filter(id => id !== loser);
        state.cupState!.eliminatedClubs.push(loser);

        if (loser === playerClubId) playerEliminated = true;
        if (winner === playerClubId) playerAdvanced = true;
      });

      if (playerEliminated) {
        state.inbox.unshift({
          id: `cup_elim_${state.currentMatchday}`,
          sender: "Board of Directors",
          subject: `Eliminated from the Domestic Cup`,
          body: `We are extremely disappointed with the team's exit from the cup. We expected a much deeper run.`,
          date: `Matchday ${state.currentMatchday}`,
          read: false,
          type: "board"
        });
      } else if (playerAdvanced) {
         state.inbox.unshift({
          id: `cup_adv_${state.currentMatchday}`,
          sender: "Board of Directors",
          subject: `Advanced in the Domestic Cup!`,
          body: `Congratulations on progressing to the next round of the cup!`,
          date: `Matchday ${state.currentMatchday}`,
          read: false,
          type: "board"
        });
      }

      const nextRounds: Record<string, string> = {
        "Round 1": "Round 2",
        "Round 2": "Quarter Final",
        "Quarter Final": "Semi Final",
        "Semi Final": "Final"
      };
      const nextRoundName = nextRounds[state.cupState.currentRound];

      if (nextRoundName && state.cupState.activeClubs.length > 1) {
        state.cupState.currentRound = nextRoundName;
        const nextMatchday = state.currentMatchday + 5; 
        const newFixtures = generateCupFixturesForRound(state.cupState.activeClubs, playerClub.league, nextRoundName, nextMatchday);
        state.fixtures.push(...newFixtures);
      } else if (state.cupState.activeClubs.length === 1) {
        state.cupState.winnerId = state.cupState.activeClubs[0];
        const winnerName = state.clubs.find(c => c.id === state.cupState!.winnerId)?.name;
        state.inbox.unshift({
          id: `cup_winner_${state.currentMatchday}`,
          sender: "Football Association",
          subject: `${winnerName} Wins the Domestic Cup!`,
          body: `${winnerName} have lifted the Domestic Cup after a thrilling tournament run!`,
          date: `Matchday ${state.currentMatchday}`,
          read: false,
          type: "media"
        });
      }
    }


    // Continental Cup Progression Logic
    if (state.continentalCups) {
      const processContinentalKnockouts = (compName: string, statePrefix: string) => {
        // Did we just finish a knockout round matchday?
        const playedKnockouts = state.fixtures.filter(
          f => f.league === compName && f.matchday === state.currentMatchday && f.played && (f.round && f.round.startsWith("Knockout - "))
        );

        if (playedKnockouts.length > 0) {
          const advancingTeams: string[] = [];
          playedKnockouts.forEach(f => {
            const winner = (f.homeScore! > f.awayScore!) ? f.homeClubId : f.awayClubId;
            advancingTeams.push(winner);
          });
          
          if (advancingTeams.length > 1) {
            let nextRound = "";
            let nextMd = state.currentMatchday + 4;
            if (advancingTeams.length === 8) nextRound = "Quarter Final";
            if (advancingTeams.length === 4) nextRound = "Semi Final";
            if (advancingTeams.length === 2) nextRound = "Final";
            
            // Generate next round
            for (let i = 0; i < advancingTeams.length; i += 2) {
              state.fixtures.push({
                id: `cup_${compName.replace(/\s/g, '').toLowerCase()}_${nextRound.replace(/\s/g, '')}_${Date.now()}_${i}`,
                league: compName,
                competition: "Continental" as any,
                round: `Knockout - ${nextRound}`,
                matchday: nextMd,
                homeClubId: advancingTeams[i],
                awayClubId: advancingTeams[i+1],
                homeScore: null,
                awayScore: null,
                played: false
              });
            }
          } else if (advancingTeams.length === 1) {
            // Winner crowned
            const winnerName = state.clubs.find(cl => cl.id === advancingTeams[0])?.name;
            state.inbox.unshift({
              id: `cup_winner_${compName}_${state.currentMatchday}`,
              sender: "UEFA",
              subject: `${winnerName} Wins the ${compName}!`,
              body: `${winnerName} have lifted the ${compName} trophy!`,
              date: `Matchday ${state.currentMatchday}`,
              read: false,
              type: "media"
            });
          }
        }
      };

      processContinentalKnockouts("Champions League", "championsLeague");
      processContinentalKnockouts("Europa League", "europaLeague");

      // Did we just finish Matchday 20 (Group Stages done)?
      if (state.currentMatchday === 20) {
        const generateRo16 = (cupState: any, compName: string) => {
          const advancingTeams: string[] = [];
          for (const gName in cupState.groups) {
            // Already sorted in rebuildStandings, take top 2
            advancingTeams.push(cupState.groups[gName][0].clubId);
            advancingTeams.push(cupState.groups[gName][1].clubId);
          }
          
          // advancingTeams has 16 teams. Generate Ro16 fixtures for Matchday 24
          for (let i = 0; i < 16; i += 2) {
            state.fixtures.push({
              id: `cup_${compName.replace(/\s/g, '').toLowerCase()}_ro16_${Date.now()}_${i}`,
              league: compName,
              competition: "Continental" as any,
              round: `Knockout - Round of 16`,
              matchday: 24,
              homeClubId: advancingTeams[i],
              awayClubId: advancingTeams[i+1],
              homeScore: null,
              awayScore: null,
              played: false
            });
          }
        };

        generateRo16(state.continentalCups.championsLeague, "Champions League");
        generateRo16(state.continentalCups.europaLeague, "Europa League");
        
        state.inbox.unshift({
          id: `cup_ro16_${state.currentMatchday}`,
          sender: "UEFA",
          subject: "Continental Cups Group Stage Concludes",
          body: "The group stages have finished. The Round of 16 draw is complete!",
          date: `Matchday ${state.currentMatchday}`,
          read: false,
          type: "media"
        });
      }
    }

    const nextMDay = state.currentMatchday + 1;
    const isEplOrLaLigaOrSerieA = ["EPL", "La Liga", "Serie A"].includes(
      state.clubs.find(c => c.id === state.selectedClubId)!.league
    );
    const maxMatchdays = isEplOrLaLigaOrSerieA ? 38 : 34;

    if (nextMDay > maxMatchdays) {
      // Season End!
      // Add season recap message
      const playerClub = state.clubs.find(c => c.id === state.selectedClubId)!;
      const standings = state.standings[playerClub.league];
      const playerPos = standings.findIndex(s => s.clubId === playerClub.id) + 1;

      // Handle Manager Reputation boost based on final position
      let repGained = 0;
      let titleMessage = "";
      if (playerPos === 1) {
        repGained = 15;
        state.manager.titlesWon++;
        state.manager.achievements.push("First Title");
        titleMessage = "CONGRATULATIONS! You have won the league title! The fans are singing your name in the streets.";
      } else if (playerPos <= 4) {
        repGained = 8;
        titleMessage = "Excellent season! You have qualified for European football next season.";
      } else if (playerPos <= 10) {
        repGained = 3;
        titleMessage = "A solid mid-table finish. The board is content with your progress.";
      } else if (playerPos > maxMatchdays - 3) {
        repGained = -10;
        titleMessage = "Disastrous season! You finished in the relegation zone.";
      } else {
        repGained = 1;
        titleMessage = "You avoided relegation and secured survival for another season.";
      }

      state.manager.reputation = Math.max(1, Math.min(100, state.manager.reputation + repGained));
      updateReputationLabel(state.manager);
        // Check promotion eligibility
        checkPromotionEligibility(state);

      // Resolve Board Objectives
      state.boardObjectives.forEach(obj => {
        if (obj.id === "obj_1") { // Maintain Respectability
          if (playerPos <= maxMatchdays - 3) {
            obj.status = "success";
            state.boardConfidence = Math.min(100, state.boardConfidence + 15);
          } else {
            obj.status = "failed";
            state.boardConfidence -= 25;
          }
        }
        if (obj.id === "obj_2") { // Cup Run
          const eliminatedEarly = state.cupState && state.cupState.eliminatedClubs.includes(playerClub.id) && 
            (state.cupState.currentRound === "Round 1" || state.cupState.currentRound === "Round 2");
          if (!eliminatedEarly) {
            obj.status = "success";
            state.boardConfidence = Math.min(100, state.boardConfidence + 10);
          } else {
            obj.status = "failed";
            state.boardConfidence -= 15;
          }
        }
      });

      // Manager Attribute Growth
      if (repGained > 0) {
        state.manager.attributes.scouting = Math.min(20, state.manager.attributes.scouting + 1);
        state.manager.attributes.tacticalKnowledge = Math.min(20, state.manager.attributes.tacticalKnowledge + 1);
        state.manager.attributes.manManagement = Math.min(20, state.manager.attributes.manManagement + 1);
      }

      // Contract logic
      const expiredPlayers: Player[] = [];
      state.players.forEach(p => {
        if (p.clubId !== "free_agents") {
          p.contractExpiry -= 1;
          if (p.contractExpiry <= 0) {
            p.clubId = "free_agents"; // Released
            p.wage = 0;
            if (p.clubId === playerClub.id) expiredPlayers.push(p);
          }
        }
      });

      if (expiredPlayers.length > 0) {
        state.inbox.unshift({
          id: `contracts_expired_${state.currentSeason}`,
          sender: "Director of Football",
          subject: `Players Released - Contracts Expired`,
          body: `The following players have been released from the club as their contracts have expired:\n\n` +
                expiredPlayers.map(p => `- ${p.name} (${p.position})`).join("\n"),
          date: `End of Season ${state.currentSeason}`,
          read: false,
          type: "board"
        });
      }

      state.inbox.unshift({
        id: `season_end_${state.currentSeason}`,
        sender: "Club Board of Directors",
        subject: `Season ${state.currentSeason} Concluded!`,
        body: `Dear Manager ${state.manager.lastName},

The season has ended and we finished in ${playerPos} place. ${titleMessage}

We have reset the standings and scheduled the fixtures for Season ${state.currentSeason + 1}. Your transfer budget has been replenished. Let's make the next season even better!`,
        date: `End of Season ${state.currentSeason}`,
        read: false,
        type: "board"
      });

      // Reset for next season
      state.currentSeason++;
      state.currentMatchday = 1;
      
      // Reset standings
      const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal", "Serbian SuperLiga", "Swiss Super League", "Ukrainian Premier League", "Danish Superliga", "Allsvenskan", "Russian Premier League", "Ekstraklasa", "Prva HNL"];
      for (const l of leagues) {
        state.standings[l] = state.standings[l].map(s => ({
          ...s,
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: []
        }));
      }

      // Reset fixtures: purge all Domestic Cup fixtures, reset League fixtures
      state.fixtures = state.fixtures.filter(f => f.competition === "League").map(f => ({
        ...f,
        played: false,
        homeScore: null,
        awayScore: null,
        events: undefined,
        stats: undefined,
        playerRatings: undefined,
        motmId: undefined,
        tacticalAnalysis: undefined,
        pressQuote: undefined
      }));

      // Generate new Round 1 Cup fixtures for the new season
      for (const l of leagues) {
        const leagueClubs = state.clubs.filter(c => c.league === l);
        const cupFixtures = generateCupFixturesForRound(leagueClubs.map(c => c.id), l, "Round 1", 5);
        state.fixtures.push(...cupFixtures);
      }

      // Reset Cup State
      if (state.cupState) {
        state.cupState = {
          activeClubs: state.clubs.filter(c => c.league === playerClub.league).map(c => c.id),
          eliminatedClubs: [],
          currentRound: "Round 1",
          winnerId: null
        };
      }

      // Replenish budget based on reputation
      state.transferBudget += Math.floor(playerClub.transferBudget * 0.5);

    } else {
      // Normal matchday advance
      state.currentMatchday = nextMDay;
      state.gameLog.unshift(`Advanced to Matchday ${nextMDay}.`);

      const playerClub = state.clubs.find(c => c.id === state.selectedClubId)!;

      // Matchday Economics
      const myPlayers = state.players.filter(p => p.clubId === playerClub.id);
      const currentWages = myPlayers.reduce((sum, p) => sum + p.wage, 0);
      const scoutWages = (state.scouts || []).reduce((sum, s) => sum + s.wage, 0);
      const totalWages = currentWages + scoutWages;

      state.transferBudget -= totalWages; // deduct weekly wages
      state.transferBudget -= 25000; // base stadium maintenance / travel cost

      // Penalty for overspending
      if (totalWages > state.wageBudget) {
        state.boardConfidence -= 1;
      }
      if (state.transferBudget < 0) {
        state.boardConfidence -= 5;
      }

      // Home Matchday Revenue
      const currentFixture = state.fixtures.find(f => f.matchday === state.currentMatchday && f.homeClubId === playerClub.id);
      if (currentFixture) {
        const priceModifier = Math.max(0, 1 - ((state.ticketPrice - 40) / 100)); // 40 = 1, 90 = 0.5
        const repModifier = state.manager.reputation / 100;
        const attendancePct = Math.min(1, 0.4 + (repModifier * 0.4) + (priceModifier * 0.2));
        const matchdayIncome = Math.floor(playerClub.capacity * attendancePct * state.ticketPrice);
        state.transferBudget += matchdayIncome;
        state.gameLog.unshift(`Home Matchday Revenue: +£${matchdayIncome.toLocaleString()}`);
        // Award skill points each matchday
        addManagerSkillPoints(state, { Tactics: 1, Finances: 1, Scouting: 1, Negotiation: 1, Training: 1, Media: 1 });
      }

      // Check stadium expansion completion
      if (state.stadiumExpansion && state.currentMatchday >= state.stadiumExpansion.targetMatchday) {
        playerClub.capacity += state.stadiumExpansion.capacityIncrease;
        state.inbox.unshift({
          id: `stadium_exp_${state.currentMatchday}`,
          sender: "Board of Directors",
          subject: `Stadium Expansion Completed!`,
          body: `Great news! The stadium expansion project has been completed. Our capacity has increased by ${state.stadiumExpansion.capacityIncrease.toLocaleString()} to a total of ${playerClub.capacity.toLocaleString()}!`,
          date: `Matchday ${state.currentMatchday}`,
          read: false,
          type: "board"
        });
        state.stadiumExpansion = undefined;
      }

      // Sacking Check
      if (state.boardConfidence <= 0) {
        state.isGameOver = true;
      }

      // Decrease scouting task timers
      state.scoutingTasks = state.scoutingTasks.map(task => {
        if (task.completed) return task;
        const daysLeft = task.daysRemaining - 1;
        if (daysLeft <= 0) {
          // Completed scouting!
          state.inbox.unshift({
            id: `scout_task_${task.id}`,
            sender: "Chief Scout",
            subject: `Scouting Completed: ${task.playerName}`,
            body: `Your scout has finished observing ${task.playerName}. The player looks like a ${task.playerRatingMin}-${task.playerRatingMax} potential prospect, valued around €${(task.estimatedValue! / 1000000).toFixed(1)}M.`,
            date: `Matchday ${state.currentMatchday}`,
            read: false,
            type: "media"
          });
          return { ...task, daysRemaining: 0, completed: true };
        }
        return { ...task, daysRemaining: daysLeft };
      });

      // Run player development training ticks
      developPlayers(state);

      // Decrease injury and suspension timers
      state.players.forEach(p => {
        if (p.injuryStatus === "Injured" && p.injuryDuration) {
          p.injuryDuration--;
          if (p.injuryDuration <= 0) {
            p.injuryStatus = "Fit";
            p.injuryDuration = 0;
            if (p.clubId === state.selectedClubId) {
              state.inbox.unshift({
                id: `injury_recover_${p.id}_${state.currentMatchday}`,
                sender: "Medical Team", subject: `Injury Update: ${p.name}`,
                body: `${p.name} has recovered from their injury and is fit to play again.`, date: `Matchday ${state.currentMatchday}`, read: false, type: "board"
              });
            }
          }
        }
        if (p.injuryStatus === "Suspended" && p.suspensionDuration) {
          p.suspensionDuration--;
          if (p.suspensionDuration <= 0) {
            p.injuryStatus = "Fit";
            p.suspensionDuration = 0;
            if (p.clubId === state.selectedClubId) {
              state.inbox.unshift({
                id: `susp_recover_${p.id}_${state.currentMatchday}`,
                sender: "Football Association", subject: `Suspension Served: ${p.name}`,
                body: `${p.name} has served their suspension and is eligible for selection.`, date: `Matchday ${state.currentMatchday}`, read: false, type: "board"
              });
            }
          }
        }
      });

      // Random event: Board review or Player moral complaints
      triggerRandomSaveEvent(state);

      // Transfer window logic
      const isTransferWindow = (state.currentMatchday >= 1 && state.currentMatchday <= 4) || (state.currentMatchday >= 19 && state.currentMatchday <= 22);
      if (isTransferWindow) {
        const playerClub = state.clubs.find(c => c.id === state.selectedClubId)!;
        const listedPlayers = state.players.filter(p => p.clubId === playerClub.id && p.isTransferListed);
        
        listedPlayers.forEach(player => {
          if (!player.transferOffers) player.transferOffers = [];
          
          // 40% chance per matchday to receive an offer if listed
          if (Math.random() < 0.4 && player.transferOffers.length < 3) {
            const buyers = state.clubs.filter(c => c.id !== playerClub.id && c.reputation >= playerClub.reputation - 20);
            const buyer = buyers[Math.floor(Math.random() * buyers.length)] || state.clubs[0];
            const discount = player.age > 30 ? 0.75 : 0.9;
            const offerFee = Math.floor(player.value * (discount + Math.random() * 0.15));

            // Prevent duplicate club bids
            if (!player.transferOffers.some(o => o.clubId === buyer.id)) {
              player.transferOffers.push({ clubId: buyer.id, amount: offerFee });
              
              state.inbox.unshift({
                id: `trans_offer_${player.id}_${Date.now()}`,
                sender: buyer.name,
                subject: `TRANSFER BID: ${player.name}`,
                body: `${buyer.name} has submitted a formal bid of €${(offerFee/1000000).toFixed(2)}M for your transfer-listed player, ${player.name}.\n\nYou can review and accept this offer in the Transfer Centre -> Sell Players tab.`,
                date: `Matchday ${state.currentMatchday}`,
                read: false,
                type: "board"
              });
            }
          }
        });
      }
    }

    updateActiveSave(state);
  };

  return (
    <GameContext.Provider value={{
      activeSave,
      savesList,
      loading,
      loadSave,
      createNewGame,
      deleteGame,
      updateActiveSave,
      playMatchdayCpuGames,
      completeLiveMatch,
      advanceToNextMatchday,
      exitToMainMenu
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// Helpers
function DEFAULT_TACTICS_MOCK(): any {
  return {
    mentality: "Balanced",
    pressIntensity: "Mid",
    defensiveLine: "Standard",
    width: "Standard",
    tempo: "Normal",
    passingDirectness: "Mixed",
    crossingFrequency: "Sometimes",
    pressingTrigger: "Mid",
    offsideTrap: false,
    counterAttackSpeed: "Balanced",
    counterPress: false,
    takers: { penalties: "", corners: "", freeKicks: "" }
  };
}

function updateManagerStatsFromFixture(state: SaveState, fixture: MatchFixture) {
  const isPlayerHome = fixture.homeClubId === state.selectedClubId;
  const isPlayerAway = fixture.awayClubId === state.selectedClubId;
  if (!isPlayerHome && !isPlayerAway) return;

  const m = state.manager;
  if (fixture.homeScore! > fixture.awayScore!) {
    if (isPlayerHome) m.winCount++; else m.lossCount++;
  } else if (fixture.homeScore! < fixture.awayScore!) {
    if (isPlayerAway) m.winCount++; else m.lossCount++;
  } else {
    m.drawCount++;
  }

  m.goalsScored += isPlayerHome ? fixture.homeScore! : fixture.awayScore!;

  // Achievements
  if (m.winCount === 1 && !m.achievements.includes("First Win")) {
    m.achievements.push("First Win");
  }
}

function updatePlayerStatsFromFixture(state: SaveState, fixture: MatchFixture, homeSquad: Player[], awaySquad: Player[]) {
  // Grant Sharpness and Appearances to players who played
  if (fixture.playerRatings) {
    Object.keys(fixture.playerRatings).forEach(playerId => {
      const p = state.players.find(pl => pl.id === playerId);
      if (p) {
        p.sharpness = Math.min(100, (p.sharpness || 50) + 5);
        p.appearances = (p.appearances || 0) + 1;
      }
    });
  }

  if (!fixture.events) return;
  
  fixture.events.forEach(event => {
    const player = state.players.find(p => p.name === event.playerName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
    
    if (player) {
      if (event.type === "Goal" || event.type === "Penalty Goal") {
        player.goals = (player.goals || 0) + 1;
      } else if (event.type === "Injury" && player.injuryStatus !== "Injured") {
        player.injuryStatus = "Injured";
        player.injuryDuration = Math.floor(Math.random() * 5) + 1;
      } else if (event.type === "Red Card" && player.injuryStatus !== "Suspended") {
        player.injuryStatus = "Suspended";
        player.suspensionDuration = Math.floor(Math.random() * 3) + 1;
      }
    }

    if (event.assistName) {
      const assister = state.players.find(p => p.name === event.assistName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
      if (assister) {
        assister.assists = (assister.assists || 0) + 1;
      }
    }
  });
}

function rebuildStandings(state: SaveState) {
  const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal", "Serbian SuperLiga", "Swiss Super League", "Ukrainian Premier League", "Danish Superliga", "Allsvenskan", "Russian Premier League", "Ekstraklasa", "Prva HNL"];
  
  for (const league of leagues) {
    const leagueClubs = state.clubs.filter(c => c.league === league);
    const leagueStandings: Standing[] = leagueClubs.map(c => ({
      clubId: c.id,
      clubName: c.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      form: []
    }));

    // Get all played fixtures in this league up to current matchday
    const playedFixtures = state.fixtures.filter(
      f => f.league === league && f.played && f.matchday <= state.currentMatchday
    );

    playedFixtures.forEach(f => {
      const homeStanding = leagueStandings.find(s => s.clubId === f.homeClubId)!;
      const awayStanding = leagueStandings.find(s => s.clubId === f.awayClubId)!;

      const hs = f.homeScore ?? 0;
      const as = f.awayScore ?? 0;

      homeStanding.played++;
      awayStanding.played++;
      homeStanding.gf += hs;
      homeStanding.ga += as;
      awayStanding.gf += as;
      awayStanding.ga += hs;
      homeStanding.gd = homeStanding.gf - homeStanding.ga;
      awayStanding.gd = awayStanding.gf - awayStanding.ga;

      if (hs > as) {
        homeStanding.won++;
        homeStanding.points += 3;
        homeStanding.form.push("W");
        awayStanding.lost++;
        awayStanding.form.push("L");
      } else if (hs < as) {
        awayStanding.won++;
        awayStanding.points += 3;
        awayStanding.form.push("W");
        homeStanding.lost++;
        homeStanding.form.push("L");
      } else {
        homeStanding.drawn++;
        homeStanding.points += 1;
        homeStanding.form.push("D");
        awayStanding.drawn++;
        awayStanding.points += 1;
        awayStanding.form.push("D");
      }
    });

    // Sort standings by points desc, gd desc, gf desc
    leagueStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    // Cap form history to last 5
    leagueStandings.forEach(s => {
      if (s.form.length > 5) {
        s.form = s.form.slice(-5);
      }
    });

    state.standings[league] = leagueStandings;
  }
}

function updateReputationLabel(manager: Manager) {
  const r = manager.reputation;
  if (r < 15) manager.reputationLabel = "Sunday League";
  else if (r < 35) manager.reputationLabel = "Amateur";
  else if (r < 55) manager.reputationLabel = "Semi-Pro";
  else if (r < 75) manager.reputationLabel = "Professional";
  else if (r < 90) manager.reputationLabel = "Continental";
  else manager.reputationLabel = "World Class";
}

function developPlayers(state: SaveState) {
  state.players.forEach(p => {
    // Sharpness decay for not playing (matchday advance)
    p.sharpness = Math.max(0, (p.sharpness || 50) - 2);

    // Determine coach multipliers
    let coachMultiplier = 1;
    if (state.coaches && p.clubId === state.selectedClubId) {
      const relevantCoaches = state.coaches.filter(c => 
        (c.type === "Fitness" && (p.trainingFocus === "Fitness" || p.trainingFocus === "Balanced")) ||
        (c.type === "Attacking" && p.trainingFocus === "Attacking") ||
        (c.type === "Defensive" && p.trainingFocus === "Defensive") ||
        (c.type === "Tactical" && p.trainingFocus === "Tactical")
      );
      relevantCoaches.forEach(c => {
        coachMultiplier += c.level * 0.25;
      });
    }

    // Determine training focus speed
    // Older players (28+) start to decline slightly in physical attributes
    // Young players (<21) develop rapidly if potential is high
    const isYoung = p.age <= 21;
    const isOld = p.age >= 28;

    const potentialGap = p.potential - p.overall;
    if (potentialGap > 0) {
      const baseGrowth = (isYoung ? 0.25 : 0.08) * coachMultiplier;
      const growthRoll = Math.random();
      
      if (growthRoll < baseGrowth) {
        // Growth!
        p.overall = Math.min(p.potential, p.overall + 1);
        
        // Boost attribute based on training focus
        let eligibleAttrs: (keyof Player)[] = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "stamina"];
        
        if (p.trainingFocus === "Fitness") {
          eligibleAttrs = ["pace", "stamina", "physical"];
        } else if (p.trainingFocus === "Attacking") {
          eligibleAttrs = ["shooting", "dribbling", "passing"];
        } else if (p.trainingFocus === "Defensive") {
          eligibleAttrs = ["defending", "physical", "stamina"];
        } else if (p.trainingFocus === "Tactical") {
          eligibleAttrs = ["mental", "passing", "stamina"];
        }
        
        const randomAttr = eligibleAttrs[Math.floor(Math.random() * eligibleAttrs.length)] as string;
        (p as any)[randomAttr] = Math.min(99, ((p as any)[randomAttr] || 70) + 1);
        
        // Re-evaluate value
        p.value = calculateValue(p.overall, p.age);
      }
    }

    if (isOld) {
      const baseDecline = (p.age - 27) * 0.02; // higher age increases decline speed
      if (Math.random() < baseDecline) {
        // Decline!
        p.overall = Math.max(50, p.overall - 1);
        // Decrease pace or stamina
        const declineAttr = Math.random() < 0.5 ? "pace" : "stamina";
        (p as any)[declineAttr] = Math.max(1, ((p as any)[declineAttr] || 70) - 1);
        
        p.value = calculateValue(p.overall, p.age);
      }
    }
  });
}

function triggerRandomSaveEvent(state: SaveState) {
  const roll = Math.random();
  const playerClub = state.clubs.find(c => c.id === state.selectedClubId)!;
  const standings = state.standings[playerClub.league];
  const playerPos = standings.findIndex(s => s.clubId === playerClub.id) + 1;

  // Board Confidence Check
  // E.g. expected position is based on club reputation.
  // Rep 90 -> Expect top 3. Rep 80 -> Expect top 8. Rep 70 -> Expect to avoid relegation.
  let expectedPosition = 15;
  if (playerClub.reputation >= 90) expectedPosition = 4;
  else if (playerClub.reputation >= 80) expectedPosition = 8;
  else if (playerClub.reputation >= 75) expectedPosition = 12;

  let confidenceShift = 0;
  if (playerPos <= expectedPosition) {
    confidenceShift = 2; // Gaining confidence
  } else {
    confidenceShift = -3; // Losing confidence
  }

  state.boardConfidence = Math.max(0, Math.min(100, state.boardConfidence + confidenceShift));

  // Check for trigger warning or sacking if confidence is extremely low
  if (state.boardConfidence <= 0) {
    // SACKED
    if (typeof window !== "undefined") {
      alert("YOU HAVE BEEN SACKED! Board confidence reached 0. Returning to Main Menu.");
      sessionStorage.removeItem("gaffer_iq_active_save_id");
      window.location.href = "/";
      return;
    }
  } else if (state.boardConfidence < 20 && state.currentMatchday >= 8) {
    state.inbox.unshift({
      id: `board_warning_${state.currentMatchday}`,
      sender: "Club President",
      subject: "ULTIMATUM: Your Job is on the line",
      body: `We are extremely concerned by our current position in the table (${playerPos} place). The board is losing confidence rapidly. You must turn results around immediately, or we will be forced to terminate your contract.`,
      date: `Matchday ${state.currentMatchday}`,
      read: false,
      type: "board"
    });
  }

  // --- YOUTH ACADEMY INTAKE ---
  // Generate youth players on Matchdays 15 and 35
  if (state.currentMatchday === 15 || state.currentMatchday === 35) {
    const academyLvl = state.academyLevel || 1;
    // Generate 1-3 prospects
    const numProspects = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numProspects; i++) {
      const age = Math.floor(Math.random() * 2) + 15; // 15 or 16
      
      // Potential scales with academy level
      const basePotential = 60 + (academyLvl * 5);
      const potentialVariance = Math.floor(Math.random() * 15) - 5; // -5 to +10
      const potential = Math.min(99, basePotential + potentialVariance);
      
      const overall = Math.floor(potential * 0.6) + Math.floor(Math.random() * 10); // Start at ~60-70% of potential
      
      const posArr = ["GK", "DEF", "MID", "ATT"];
      const pos = posArr[Math.floor(Math.random() * posArr.length)];
      
      const newPlayer = {
        id: `regen_${Date.now()}_${i}`,
        name: `Youth Prospect ${state.currentMatchday}-${i+1}`, // Simplistic name gen
        clubId: playerClub.id,
        position: pos as any,
        age: age,
        overall: overall,
        potential: potential,
        pace: overall,
        shooting: overall,
        passing: overall,
        dribbling: overall,
        defending: overall,
        physical: overall,
        mental: overall,
        stamina: overall,
        morale: 100,
        sharpness: 50,
        trainingFocus: "Balanced" as any,
        value: 100000 * academyLvl,
        wage: 500,
        contractLength: 3,
        isTransferListed: false,
        isAcademy: true,
        nationality: "Unknown",
        nationalityFlag: "🌍",
        personality: "Professional" as any,
        contractExpiry: 3,
        injuryStatus: "Fit" as any,
        goals: 0,
        assists: 0,
        appearances: 0,
        cleanSheets: 0,
        rating: 0,
        ratingHistory: [],
        transferOffers: []
      };
      state.players.push(newPlayer);
    }

    state.inbox.unshift({
      id: `youth_intake_${state.currentMatchday}`,
      sender: "Academy Director",
      subject: "New Youth Academy Intake",
      body: `Good news boss, we have ${numProspects} new prospects who have just joined the Youth Academy. Check the Academy dashboard to view their potential and assign training.`,
      date: `Matchday ${state.currentMatchday}`,
      read: false,
      type: "board"
    });
  }

  // Random player morale complaints
  if (roll < 0.08) {
    const playerSquad = state.players.filter(p => p.clubId === playerClub.id);
    const lowGameTimePlayer = playerSquad.find(p => p.overall < 75 && p.morale > 40);
    if (lowGameTimePlayer) {
      lowGameTimePlayer.morale = Math.max(10, lowGameTimePlayer.morale - 15);
      state.inbox.unshift({
        id: `player_morale_${lowGameTimePlayer.id}_${state.currentMatchday}`,
        sender: lowGameTimePlayer.name,
        subject: "Concern regarding playing time",
        body: `Boss, I wanted to talk about my role at the club. I feel like I am in good form but I'm not getting enough game time. I'd appreciate more starts or I may have to look for opportunities elsewhere.`,
        date: `Matchday ${state.currentMatchday}`,
        read: false,
        type: "player"
      });
    }
  }

  // Realistic News Generation
  if (Math.random() < 0.5) { // increased frequency again
    if (!state.newsFeed) state.newsFeed = [];
    const newsAuthors = [
      { name: "Fabrizio Romano", handle: "@FabrizioRomano" },
      { name: "David Ornstein", handle: "@David_Ornstein" },
      { name: "The Athletic FC", handle: "@TheAthleticFC" },
      { name: "Sky Sports News", handle: "@SkySportsNews" },
      { name: "Goal", handle: "@goal" },
      { name: "ESPN FC", handle: "@ESPNFC" },
      { name: "B/R Football", handle: "@brfootball" },
      { name: "Gianluca Di Marzio", handle: "@DiMarzio" },
      { name: "BBC Sport", handle: "@BBCSport" }
    ];
    
    const randomPlayer = state.players[Math.floor(Math.random() * state.players.length)];
    const randomClub = state.clubs[Math.floor(Math.random() * state.clubs.length)];
    const author = newsAuthors[Math.floor(Math.random() * newsAuthors.length)];
    const types: ("transfer" | "drama" | "general" | "injury")[] = ["transfer", "drama", "general", "injury"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let content = "";
    if (type === "transfer") {
      const templates = [
        `🚨 EXCLUSIVE: ${randomClub.name} are reportedly monitoring ${randomPlayer.name}. Negotiations could start soon!`,
        `BREAKING: Advanced talks between ${randomClub.name} and the representatives of ${randomPlayer.name}. Deal getting closer. ⏳`,
        `Sources confirm ${randomClub.name} are preparing a massive bid for ${randomPlayer.name}. Will his club let him go?`,
        `${randomPlayer.name} has verbally agreed personal terms with ${randomClub.name}. Now waiting for the clubs to agree on a fee.`,
        `Surprise move? ${randomClub.name} have inquired about the availability of ${randomPlayer.name}.`,
        `Understand ${randomClub.name} have added ${randomPlayer.name} to their shortlist for the upcoming window. Nothing agreed yet.`,
        `The agent of ${randomPlayer.name} has been spotted in the same city as the ${randomClub.name} executives. Coincidence?`,
        `${randomClub.name} consider ${randomPlayer.name} a 'top target'. The manager is pushing hard for this signing.`,
        `Contract extension talks for ${randomPlayer.name} have stalled. ${randomClub.name} are watching the situation closely.`,
        `Done Deal? Sources say ${randomPlayer.name} to ${randomClub.name} is 99% completed. Medical tests scheduled for next week. Here we go soon?`
      ];
      content = templates[Math.floor(Math.random() * templates.length)];
    } else if (type === "drama") {
      const templates = [
        `Tension inside the dressing room! Sources say ${randomPlayer.name} is unhappy with the current tactics at his club.`,
        `Spotted: ${randomPlayer.name} storming down the tunnel after being substituted last weekend. Manager says "it's an internal matter."`,
        `Reports suggest a training ground bust-up involving ${randomPlayer.name}. Is he forcing a move away?`,
        `The fans are turning on the board at ${randomClub.name} after a string of poor decisions. "We demand change!"`,
        `${randomClub.name} manager under massive pressure as rumors circulate that the board has lost confidence in his project.`,
        `${randomPlayer.name} has been fined by the club for arriving late to training for the third time this month.`,
        `Leaked messages reveal a massive rift between the ${randomClub.name} manager and the squad's senior players.`,
        `Controversy! Did the referee cost ${randomClub.name} the game? The manager faces a fine for his post-match comments.`,
        `Fan protests outside the ${randomClub.name} training ground today. The atmosphere around the club is toxic right now.`,
        `${randomPlayer.name}'s cryptic social media post has sent the fanbase into a frenzy. What does it mean?`
      ];
      content = templates[Math.floor(Math.random() * templates.length)];
    } else if (type === "injury") {
      const templates = [
        `Injury blow for ${randomPlayer.name}? He was seen limping during training today. Tests pending.`,
        `Terrible news for fans: ${randomPlayer.name} stretchered off during a behind-closed-doors friendly. Looks serious.`,
        `Medical update: ${randomPlayer.name} successfully underwent surgery. He will be sidelined for several weeks.`,
        `${randomClub.name} face an injury crisis! The medical room is full and the manager is running out of options.`,
        `A minor muscle tweak means ${randomPlayer.name} is a doubt for the upcoming crucial fixture.`
      ];
      content = templates[Math.floor(Math.random() * templates.length)];
    } else {
      const templates = [
        `${randomClub.name} manager says the team is fully focused on the next match despite recent controversies.`,
        `An incredible season so far for ${randomPlayer.name}, whose underlying stats suggest he is currently one of the best in his position globally.`,
        `The atmosphere at the ${randomClub.name} stadium is expected to be electric this weekend as they prepare for a crucial fixture.`,
        `Stat of the day: ${randomPlayer.name} has covered more ground than any other player in the league over the last 3 matchdays.`,
        `Tactical analysis: How ${randomClub.name} completely dominated the midfield in their recent fixtures.`,
        `Is ${randomPlayer.name} the most underrated player in the league right now? The numbers say yes.`,
        `${randomClub.name} announce a new multi-year stadium naming rights deal in a massive commercial boost.`,
        `Pundits are tipping ${randomClub.name} to exceed expectations this season. "They are playing brilliant football."`,
        `Flashback: On this day 10 years ago, ${randomClub.name} secured a historic victory. Will they replicate that magic today?`,
        `Manager of the Month? The boss at ${randomClub.name} is receiving widespread praise for his innovative tactics.`
      ];
      content = templates[Math.floor(Math.random() * templates.length)];
    }
    
    state.newsFeed.unshift({
      id: `news_${Date.now()}_${Math.random()}`,
      author: author.name,
      handle: author.handle,
      content,
      likes: Math.floor(Math.random() * 50000) + 1000,
      type,
      date: `Matchday ${state.currentMatchday}`
    });
    
    // Keep only last 20
    if (state.newsFeed.length > 20) state.newsFeed = state.newsFeed.slice(0, 20);
  }
}
