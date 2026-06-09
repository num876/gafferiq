/* eslint-disable */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import {
  Player,
  Club,
  calculateValue,
  LEAGUE_INFO,
} from "../../../config/seededData";
import {
  Search,
  Sliders,
  ChevronDown,
  Check,
  X,
  DollarSign,
  Sparkles,
  Plus,
  Minus,
  Landmark,
  Inbox,
  Heart,
  Shield,
  LayoutGrid,
  List,
  FileSearch,
  ArrowRight,
  User,
  ArrowLeftRight,
} from "lucide-react";
import { CLUB_LOGOS } from "../../../config/clubLogos";
import { motion, AnimatePresence } from "framer-motion";

// Helper to generate mock procedural stats for a player
const generateAttributes = (player: Player) => {
  return {
    pac: player.pace || player.overall,
    sho: player.shooting || player.overall,
    pas: player.passing || player.overall,
    def: player.defending || player.overall,
    phy: player.physical || player.overall,
  };
};

export default function Transfers() {
  const { activeSave, updateActiveSave } = useGame();

  // Modal / Interaction states
  const [scoutedPlayer, setScoutedPlayer] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidStep, setBidStep] = useState<
    "bid" | "negotiating" | "contract" | "declined" | "accepted"
  >("bid");
  const [offerType, setOfferType] = useState<"permanent" | "loan">("permanent");
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [suggestedFee, setSuggestedFee] = useState<number>(0);

  // Contract offer state
  const [contractYears, setContractYears] = useState<number>(3);
  const [offeredWage, setOfferedWage] = useState<number>(0);
  const [contractMessage, setContractMessage] = useState("");

  const [reviewingPlayer, setReviewingPlayer] = useState<Player | null>(null);

  // State for tabs
  const [activeTab, setActiveTab] = useState<"browse" | "squad" | "history">(
    "browse",
  );

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<number>(16);
  const [maxAge, setMaxAge] = useState<number>(40);
  const [minOvr, setMinOvr] = useState<number>(50);
  const [maxOvr, setMaxOvr] = useState<number>(99);
  const [freeAgentsOnly, setFreeAgentsOnly] = useState(false);
  const [wonderkidsOnly, setWonderkidsOnly] = useState(false);

  const isTransferWindow = activeSave
    ? (activeSave.currentMatchday >= 1 && activeSave.currentMatchday <= 4) ||
      (activeSave.currentMatchday >= 19 && activeSave.currentMatchday <= 22)
    : false;

  

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(
    (c) => c.id === activeSave.selectedClubId,
  )!;

  // Filter players
  const filteredPlayers = useMemo(() => {
    return activeSave.players.filter((p) => {
      if (p.clubId === playerClub.id && !p.isAcademy) return false;

      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPosition =
        selectedPositions.length === 0 ||
        selectedPositions.includes(p.position);

      const pClub = activeSave.clubs.find((c) => c.id === p.clubId);
      const matchesLeague =
        selectedLeagues.length === 0 ||
        (pClub && selectedLeagues.includes(pClub.league));

      const matchesOvr = p.overall >= minOvr && p.overall <= maxOvr;
      const matchesAge = p.age >= minAge && p.age <= maxAge;

      const matchesFreeAgent = !freeAgentsOnly || p.clubId === "free_agent";
      const matchesWonderkid =
        !wonderkidsOnly || (p.age <= 21 && p.potential >= 85);

      return (
        matchesSearch &&
        matchesPosition &&
        matchesLeague &&
        matchesOvr &&
        matchesAge &&
        matchesFreeAgent &&
        matchesWonderkid
      );
    });
  }, [
    activeSave.players,
    playerClub.id,
    searchQuery,
    selectedPositions,
    selectedLeagues,
    minOvr,
    maxOvr,
    minAge,
    maxAge,
    freeAgentsOnly,
    wonderkidsOnly,
  ]);

  // Open Scout Panel
  const openScoutPanel = (player: Player) => {
    setScoutedPlayer(player);
  };

  // Open Bid screen
  const openBidModal = (player: Player) => {
    setSelectedPlayer(player);
    setBidAmount(player.value);
    setBidStep("bid");
    setContractYears(3);
    setOfferedWage(Math.floor(player.wage * 1.1));

    if (!activeSave) return null;
    const playerClub = activeSave.clubs.find(
      (c) => c.id === activeSave.selectedClubId,
    )!;

    // Filter players
    const filteredPlayers = useMemo(() => {
      return activeSave.players.filter((p) => {
        if (p.clubId === playerClub.id && !p.isAcademy) return false;

        const matchesSearch = p.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesPosition =
          selectedPositions.length === 0 ||
          selectedPositions.includes(p.position);

        const pClub = activeSave.clubs.find((c) => c.id === p.clubId);
        const matchesLeague =
          selectedLeagues.length === 0 ||
          (pClub && selectedLeagues.includes(pClub.league));

        const matchesOvr = p.overall >= minOvr && p.overall <= maxOvr;
        const matchesAge = p.age >= minAge && p.age <= maxAge;

        const matchesFreeAgent = !freeAgentsOnly || p.clubId === "free_agent";
        const matchesWonderkid =
          !wonderkidsOnly || (p.age <= 21 && p.potential >= 85);

        return (
          matchesSearch &&
          matchesPosition &&
          matchesLeague &&
          matchesOvr &&
          matchesAge &&
          matchesFreeAgent &&
          matchesWonderkid
        );
      });
    }, [
      activeSave.players,
      playerClub.id,
      searchQuery,
      selectedPositions,
      selectedLeagues,
      minOvr,
      maxOvr,
      minAge,
      maxAge,
      freeAgentsOnly,
      wonderkidsOnly,
    ]);

    // Open Scout Panel
    const openScoutPanel = (player: Player) => {
      setScoutedPlayer(player);
    };

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

    // Negotiation Logic
    const submitBid = () => {
      if (!selectedPlayer) return;

      const value = selectedPlayer.value;
      const club = activeSave.clubs.find((c) => c.id === selectedPlayer.clubId);
      const premiumFactor = club ? club.reputation / 80 : 1.0;
      const expectedMinimum = value * 0.95 * premiumFactor;

      if (selectedPlayer.clubId === "free_agent") {
        setBidStep("contract");
        setNegotiationMessage(
          `${selectedPlayer.name} is a free agent. You can proceed directly to negotiating personal terms.`,
        );
        return;
      }

      if (offerType === "loan") {
        const acceptsLoan = Math.random() > 0.3; // 70% chance
        if (acceptsLoan || selectedPlayer.isLoanListed) {
          setBidStep("contract");
          setContractYears(1);
          setNegotiationMessage(
            `${club?.name} has agreed to loan ${selectedPlayer.name} to you for one season. Now, negotiate the wage split.`,
          );
        } else {
          setBidStep("declined");
          setNegotiationMessage(
            `${club?.name} is not interested in loaning out ${selectedPlayer.name} at this time.`,
          );
        }
        return;
      }

      if (bidAmount < value * 0.8) {
        setBidStep("declined");
        setNegotiationMessage(
          `${club?.name} has instantly rejected your bid. They refuse to sell ${selectedPlayer.name} for such an insultingly low offer.`,
        );
      } else if (bidAmount < expectedMinimum) {
        const counter = Math.floor(
          expectedMinimum * (1.05 + Math.random() * 0.1),
        );
        setSuggestedFee(counter);
        setBidStep("bid");
        setNegotiationMessage(
          `${club?.name} rejected your bid of €${(bidAmount / 1000000).toFixed(2)}M. However, they are open to negotiations and counter with €${(counter / 1000000).toFixed(2)}M.`,
        );
      } else {
        setBidStep("contract");
        setNegotiationMessage(
          `Great news! ${club?.name} has accepted your transfer bid of €${(bidAmount / 1000000).toFixed(2)}M. You are now cleared to negotiate personal terms with ${selectedPlayer.name}.`,
        );
      }
    };

    const submitContract = () => {
      if (!selectedPlayer) return;
      if (
        selectedPlayer.clubId !== "free_agent" &&
        bidAmount > activeSave.transferBudget
      ) {
        setContractMessage(
          `Insufficient funds! Your transfer budget is €${(activeSave.transferBudget / 1000000).toFixed(2)}M.`,
        );
        return;
      }
      if (offeredWage > activeSave.wageBudget) {
        setContractMessage(
          `Insufficient wage limit! Your wage limit is €${(activeSave.wageBudget / 1000).toFixed(0)}k/week.`,
        );
        return;
      }

      const demandWage =
        selectedPlayer.wage > 0
          ? selectedPlayer.wage * (1.0 + (5 - contractYears) * 0.05)
          : 5000 * (selectedPlayer.overall / 60);
      const negotiationSkill = activeSave.manager.attributes.negotiation;
      const wageDiscountFactor = 1.0 - (negotiationSkill / 20) * 0.15;
      const acceptableWage = demandWage * wageDiscountFactor;

      if (offeredWage < acceptableWage * 0.9) {
        setBidStep("contract");
        setContractMessage(
          `${selectedPlayer.name} has rejected your contract proposal. His agent demands a wage closer to €${(acceptableWage / 1000).toFixed(0)}k/week.`,
        );
      } else {
        setBidStep("accepted");
        const currentClub = activeSave.clubs.find(
          (c) => c.id === selectedPlayer.clubId,
        );

        const newState = { ...activeSave };
        const playerIndex = newState.players.findIndex(
          (p) => p.id === selectedPlayer.id,
        );

        if (playerIndex !== -1) {
          if (offerType === "loan") {
            newState.players[playerIndex] = {
              ...newState.players[playerIndex],
              onLoanFrom: selectedPlayer.clubId,
              clubId: newState.selectedClubId,
              loanDuration: contractYears,
              wage: offeredWage,
              morale: 95,
            };
            newState.wageBudget -= offeredWage;
            newState.gameLog.unshift(
              `${selectedPlayer.name} has joined on loan from ${currentClub?.name || "Free Agency"}.`,
            );
          } else {
            newState.players[playerIndex] = {
              ...newState.players[playerIndex],
              clubId: newState.selectedClubId,
              wage: offeredWage,
              contractExpiry: newState.currentSeason + contractYears,
              isTransferListed: false,
              isLoanListed: false,
              morale: 95,
            };
            newState.transferBudget -= bidAmount;
            newState.wageBudget -= offeredWage;
            newState.gameLog.unshift(
              `Signed ${selectedPlayer.name} from ${currentClub?.name || "Free Agency"} for €${(bidAmount / 1000000).toFixed(2)}M.`,
            );

            if (!newState.transfersHistory) newState.transfersHistory = [];
            newState.transfersHistory.unshift({
              id: `transfer_${Date.now()}`,
              date: `Season ${newState.currentSeason}, Matchday ${newState.currentMatchday}`,
              playerName: selectedPlayer.name,
              fromClubName: currentClub?.name || "Free Agent",
              toClubName: activeSave.clubs.find(
                (c) => c.id === activeSave.selectedClubId,
              )!.name,
              fee: bidAmount,
              type: "permanent",
              matchday: newState.currentMatchday
            });
          }
          updateActiveSave(newState);
        }
      }
    };

    const togglePosFilter = (pos: string) => {
      setSelectedPositions((prev) =>
        prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
      );
    };
    const toggleLeagueFilter = (lg: string) => {
      setSelectedLeagues((prev) =>
        prev.includes(lg) ? prev.filter((l) => l !== lg) : [...prev, lg],
      );
    };
    const toggleShortlist = (playerId: string) => {
      const isShortlisted = activeSave.scoutShortlist.includes(playerId);
      const newState = { ...activeSave };
      if (isShortlisted) {
        newState.scoutShortlist = newState.scoutShortlist.filter(
          (id) => id !== playerId,
        );
      } else {
        newState.scoutShortlist.push(playerId);
      }
      updateActiveSave(newState);
    };
    const shortlistLookup = useMemo(
      () => new Set(activeSave.scoutShortlist),
      [activeSave.scoutShortlist],
    );

    // Squad view dummy actions
    const releasePlayer = (p: Player) => {
      const newState = { ...activeSave };
      const player = newState.players.find((x) => x.id === p.id);
      if (player) {
        player.clubId = "free_agent";
        player.wage = 0;
        player.isTransferListed = false;
        updateActiveSave(newState);
      }
    };
    const toggleTransferList = (p: Player) => {
      const newState = { ...activeSave };
      const player = newState.players.find((x) => x.id === p.id);
      if (player) {
        player.isTransferListed = !player.isTransferListed;
        updateActiveSave(newState);
      }
    };

    return (
      <div className="flex flex-col w-full h-full relative">
        {/* 
        ========================================================
        STICKY FILTER BAR (PREMIUM)
        ======================================================== 
      */}
        <div className="sticky top-0 z-30 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-[#1e2d40] px-6 py-4 flex flex-col gap-4 shadow-xl -mx-6 md:-mx-8 md:px-8 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                <ArrowLeftRight className="w-5 h-5 text-[#22c55e]" /> Transfer
                Market
              </h1>
              <div className="h-6 w-px bg-[#1e2d40]"></div>
              <div className="flex gap-1 bg-[#0f1623] p-1 rounded-lg border border-[#1e2d40]">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${activeTab === "browse" ? "bg-[#1e2d40] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Scouting
                </button>
                <button
                  onClick={() => setActiveTab("squad")}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${activeTab === "squad" ? "bg-[#1e2d40] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Your Squad
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${activeTab === "history" ? "bg-[#1e2d40] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  History
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1e2d40] rounded-full py-2 pl-9 pr-4 text-sm font-bold text-white focus:outline-none focus:border-[#22c55e] transition shadow-inner"
                />
              </div>
              <div className="flex bg-[#0f1623] p-1 rounded-lg border border-[#1e2d40]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-[#22c55e] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded transition ${viewMode === "table" ? "bg-[#22c55e] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {activeTab === "browse" && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              {/* Position Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  "GK",
                  "CB",
                  "LB",
                  "RB",
                  "CDM",
                  "CM",
                  "CAM",
                  "LW",
                  "RW",
                  "ST",
                ].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePosFilter(pos)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedPositions.includes(pos) ? "bg-[#22c55e] text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-[#0f1623] border border-[#1e2d40] text-slate-400 hover:border-slate-600 hover:text-white"}`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* League Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"].map(
                  (lg) => (
                    <button
                      key={lg}
                      onClick={() => toggleLeagueFilter(lg)}
                      className={`px-2 py-1 rounded border text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${selectedLeagues.includes(lg) ? "bg-[#1e2d40] border-slate-500 text-white" : "bg-[#080c14] border-[#1e2d40] text-slate-500 hover:border-slate-700 hover:text-slate-300"}`}
                    >
                      {LEAGUE_INFO[lg as keyof typeof LEAGUE_INFO].emoji}
                    </button>
                  ),
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={freeAgentsOnly}
                    onChange={(e) => setFreeAgentsOnly(e.target.checked)}
                    className="accent-[#22c55e]"
                  />
                  Free Agents
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={wonderkidsOnly}
                    onChange={(e) => setWonderkidsOnly(e.target.checked)}
                    className="accent-[#22c55e]"
                  />
                  Wonderkids (U21)
                </label>
              </div>

              {/* OVR Slider */}
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 ml-auto">
                <span>
                  OVR: {minOvr}-{maxOvr}
                </span>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={minOvr}
                  onChange={(e) => setMinOvr(parseInt(e.target.value))}
                  className="w-16 accent-[#22c55e] h-1"
                />
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={maxOvr}
                  onChange={(e) => setMaxOvr(parseInt(e.target.value))}
                  className="w-16 accent-[#22c55e] h-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* 
        ========================================================
        BROWSE MARKET CONTENT
        ======================================================== 
      */}
        {activeTab === "browse" && (
          <div
            className={`flex-1 transition-all duration-500 ${scoutedPlayer ? "lg:pr-[380px]" : ""}`}
          >
            {filteredPlayers.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <Search className="w-10 h-10 text-slate-700" />
                <p className="text-slate-400 font-bold">
                  No players found matching your criteria.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW (Ultimate Team style cards) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredPlayers.map((player) => {
                  const club = activeSave.clubs.find((c) => c.id === player.clubId);
                  const kl = activeSave.playerKnowledge?.[player.id] ?? 0;
                  const displayOvr = kl === 2 ? player.overall : kl === 1 ? `${Math.max(50, player.overall - 5)}-${Math.min(99, player.overall + 5)}` : "??";
                  const displayVal = kl === 2 ? `€${(player.value / 1000000).toFixed(1)}M` : kl === 1 ? `€${(player.value * 0.8 / 1000000).toFixed(1)}M - €${(player.value * 1.2 / 1000000).toFixed(1)}M` : "??";
                  const displayAtt = (val: number) => kl === 2 ? val : kl === 1 ? `${Math.max(1, val - 8)}-${Math.min(99, val + 8)}` : "?";
                  
                  const isShortlisted = shortlistLookup.has(player.id);
                  const ovrColor =
                    player.overall >= 80
                      ? "bg-[#22c55e] border-white"
                      : player.overall >= 65
                        ? "bg-[#f59e0b] border-[#0a0f1e]"
                        : "bg-slate-500 border-[#0a0f1e]";
                  const attributes = generateAttributes(player);

                  return (
                    <div key={player.id} className="relative group">
                      <div
                        className={`rounded-2xl bg-[#0f1623] border ${isShortlisted ? "border-[#f59e0b]" : "border-[#1e2d40]"} p-4 flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-xl overflow-hidden`}
                      >
                        {/* Top Row: Badges */}
                        <div className="flex justify-between items-start z-10">
                          <div className="w-8 h-8 rounded-lg bg-[#080c14] border border-[#1e2d40] flex items-center justify-center p-1 shadow">
                            {club && CLUB_LOGOS[club.id] ? (
                              <img
                                src={CLUB_LOGOS[club.id]}
                                alt=""
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-black">
                                {club ? club.name.charAt(0) : "FA"}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black uppercase text-white tracking-widest">
                              {player.position}
                            </span>
                            <button
                              onClick={() => toggleShortlist(player.id)}
                              className="mt-1 transition-transform hover:scale-110"
                            >
                              <Heart
                                className={`w-4 h-4 ${isShortlisted ? "fill-[#f59e0b] text-[#f59e0b]" : "text-slate-500"}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="mt-3 z-10 text-center">
                          <h3 className="font-black text-white text-lg tracking-tight truncate">
                            {player.name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 mt-0.5 text-xs text-slate-400 font-semibold">
                            <span>{player.age} yrs</span>
                            {club ? (
                              <span className="px-1.5 py-0.5 rounded bg-[#1e2d40] text-[9px]">
                                {LEAGUE_INFO[club.league].emoji}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] uppercase">
                                Free Agent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attributes Bar Chart (Mini) */}
                        <div className="mt-4 flex justify-between px-1 z-10">
                          {[
                            {
                              lbl: "PAC",
                              val: attributes.pac,
                              color: "bg-blue-400",
                            },
                            {
                              lbl: "SHO",
                              val: attributes.sho,
                              color: "bg-rose-400",
                            },
                            {
                              lbl: "PAS",
                              val: attributes.pas,
                              color: "bg-amber-400",
                            },
                            {
                              lbl: "DEF",
                              val: attributes.def,
                              color: "bg-indigo-400",
                            },
                            {
                              lbl: "PHY",
                              val: attributes.phy,
                              color: "bg-purple-400",
                            },
                          ].map((att) => (
                            <div
                              key={att.lbl}
                              className="flex flex-col items-center gap-1 w-6"
                            >
                              <span className="text-[8px] font-black text-slate-500">
                                {att.lbl}
                              </span>
                              <div className="w-1.5 h-10 bg-[#080c14] rounded-full overflow-hidden flex flex-col justify-end">
                                <div
                                  className={`w-full rounded-full ${att.color}`}
                                  style={{ height: `${att.val}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-white">
                                {kl === 2 ? att.val : kl === 1 ? "~" + att.val : "?"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Row: OVR & Actions */}
                        <div className="mt-5 flex items-center justify-between border-t border-[#1e2d40] pt-4 z-10">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-white font-black shadow-lg ${ovrColor}`}
                            >
                              {displayOvr}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">
                                Est. Value
                              </span>
                              <span className="text-xs font-black text-white">
                                {displayVal}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => openScoutPanel(player)}
                            className="w-8 h-8 rounded-full bg-[#1e2d40] hover:bg-[#22c55e] text-white flex items-center justify-center transition-colors shadow"
                          >
                            <FileSearch className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Background Accents */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="rounded-2xl border border-[#1e2d40] bg-[#0f1623] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1e2d40] text-[10px] font-black text-slate-500 uppercase tracking-widest bg-[#080c14]">
                        <th className="py-4 px-5">Player</th>
                        <th className="py-4 px-5">Club</th>
                        <th className="py-4 px-5">Pos</th>
                        <th className="py-4 px-5">Age</th>
                        <th className="py-4 px-5">Value</th>
                        <th className="py-4 px-5">Wage</th>
                        <th className="py-4 px-5 text-right">OVR</th>
                        <th className="py-4 px-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d40]">
                      {filteredPlayers.map((player) => {
                        const club = activeSave.clubs.find((c) => c.id === player.clubId);
                        const kl = activeSave.playerKnowledge?.[player.id] ?? 0;
                        const displayOvr = kl === 2 ? player.overall : kl === 1 ? `${Math.max(50, player.overall - 5)}-${Math.min(99, player.overall + 5)}` : "??";
                        const displayVal = kl === 2 ? `€${(player.value / 1000000).toFixed(1)}M` : kl === 1 ? `€${(player.value * 0.8 / 1000000).toFixed(1)}M - €${(player.value * 1.2 / 1000000).toFixed(1)}M` : "??";
                        
                        return (
                          <tr
                            key={player.id}
                            className="hover:bg-[#162032] transition group"
                          >
                            <td className="py-3 px-5 font-bold text-white flex items-center gap-3">
                              <button
                                onClick={() => toggleShortlist(player.id)}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${shortlistLookup.has(player.id) ? "fill-[#f59e0b] text-[#f59e0b]" : "text-slate-600 group-hover:text-slate-400"}`}
                                />
                              </button>
                              {player.name}
                            </td>
                            <td className="py-3 px-5 text-slate-400 font-medium">
                              {club ? club.name : "Free Agent"}
                            </td>
                            <td className="py-3 px-5 font-black text-[#22c55e]">
                              {player.position}
                            </td>
                            <td className="py-3 px-5 text-slate-300">
                              {player.age}
                            </td>
                            <td className="py-3 px-5 font-black text-white text-[10px]">
                              {displayVal}
                            </td>
                            <td className="py-3 px-5 text-slate-400">
                              €{(player.wage / 1000).toFixed(0)}k
                            </td>
                            <td className="py-3 px-5 text-right font-black text-white text-sm">
                              {displayOvr}
                            </td>
                            <td className="py-3 px-5 text-center">
                              <button
                                onClick={() => openScoutPanel(player)}
                                className="px-4 py-1.5 rounded-full bg-[#1e2d40] hover:bg-[#22c55e] text-white text-[10px] font-bold uppercase transition"
                              >
                                Scout
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 
        ========================================================
        SCOUT SIDE PANEL (Slides in from right)
        ======================================================== 
      */}
        <AnimatePresence>
          {scoutedPlayer && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:absolute right-0 top-0 w-full lg:w-[380px] h-screen lg:h-full bg-[#0a0f1e] border-l border-[#1e2d40] shadow-2xl flex flex-col z-40 lg:z-10 mt-0 lg:mt-[0]"
              style={{ top: "0" }} // Adjust if needed to sit under sticky header
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1e2d40] bg-[#0f1623] flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-[#22c55e] bg-[#080c14] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#22c55e]/20">
                    {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? scoutedPlayer.overall : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? "~"+scoutedPlayer.overall : "??"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-tight">
                      {scoutedPlayer.name}
                    </h2>
                    <p className="text-xs text-[#22c55e] font-bold uppercase tracking-widest mt-0.5">
                      {scoutedPlayer.position} • {scoutedPlayer.age} YRS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setScoutedPlayer(null)}
                  className="p-2 rounded-full bg-[#080c14] border border-[#1e2d40] text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
                {/* Detailed Stats */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-[#22c55e] pl-2 mb-4">
                    Scout Report Attributes
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(generateAttributes(scoutedPlayer)).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="bg-[#0f1623] p-3 rounded-xl border border-[#1e2d40] flex items-center justify-between"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {key}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#080c14] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${val >= 80 ? "bg-[#22c55e]" : val >= 65 ? "bg-[#f59e0b]" : "bg-rose-500"}`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-white w-4">
                              {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? val : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? `~${val}` : "?"}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Hidden Potential */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-[#f59e0b] pl-2 mb-4">
                    Potential Rating
                  </h3>
                  <div className="bg-[#0f1623] border border-[#1e2d40] p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                      <span className="text-sm font-bold text-white">
                        Estimated Potential
                      </span>
                    </div>
                    {/* Simulate a partially blurred potential for realism */}
                    <span className="text-2xl font-black text-[#f59e0b] filter blur-[2px] group-hover:blur-none transition-all duration-300 select-none">
                      {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? scoutedPlayer.potential : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? `${Math.max(50, scoutedPlayer.potential - 5)}-${Math.min(99, scoutedPlayer.potential + 5)}` : "??"}
                    </span>
                  </div>
                </div>

                {/* Contract Info */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2 mb-4">
                    Current Contract
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#0f1623] p-3 rounded-xl border border-[#1e2d40] flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Club</span>
                      <span className="font-black text-white">
                        {activeSave.clubs.find(
                          (c) => c.id === scoutedPlayer.clubId,
                        )?.name || "Free Agent"}
                      </span>
                    </div>
                    <div className="bg-[#0f1623] p-3 rounded-xl border border-[#1e2d40] flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">
                        Estimated Value
                      </span>
                      <span className="font-black text-white">
                        €{(scoutedPlayer.value / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="bg-[#0f1623] p-3 rounded-xl border border-[#1e2d40] flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">
                        Weekly Wage
                      </span>
                      <span className="font-black text-white">
                        €{(scoutedPlayer.wage / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-[#0a0f1e]/90 backdrop-blur-md border-t border-[#1e2d40]">
                {!isTransferWindow ? (
                  <div className="text-center w-full">
                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      Market Closed
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">
                      Transfers only allowed during MD 1-4 and 19-22
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setScoutedPlayer(null);
                      openBidModal(scoutedPlayer);
                    }}
                    className="w-full py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform active:scale-95"
                  >
                    Make Bid Offer <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Negotiation & Bid Modal */}
        {bidModalOpen && selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080c14]/90 backdrop-blur-sm p-4">
            <div className="bg-[#0f1623] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[#1e2d40]">
              {/* Header */}
              <div className="p-6 bg-[#0a0f1e] border-b border-[#1e2d40] flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-white">
                    Transfer Negotiation
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Negotiating terms with {selectedPlayer.name} and his club.
                  </p>
                </div>
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="p-2 rounded-full bg-[#080c14] border border-[#1e2d40] text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-6">
                {bidStep === "bid" && (
                  <div className="flex flex-col gap-6 text-xs">
                    {negotiationMessage && (
                      <div className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] leading-relaxed font-bold">
                        {negotiationMessage}
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-[#080c14] border border-[#1e2d40] flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-white text-sm">
                          {selectedPlayer.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase">
                          OVR {selectedPlayer.overall} •{" "}
                          {selectedPlayer.position}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">
                          Market Value
                        </span>
                        <span className="font-black text-[#22c55e] text-base">
                          €{(selectedPlayer.value / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>

                    <div className="flex bg-[#080c14] border border-[#1e2d40] rounded-xl p-1 gap-1">
                      <button
                        onClick={() => setOfferType("permanent")}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition ${offerType === "permanent" ? "bg-[#16a34a] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Permanent Transfer
                      </button>
                      <button
                        onClick={() => setOfferType("loan")}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition ${offerType === "loan" ? "bg-[#3b82f6] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Season Loan
                      </button>
                    </div>

                    {offerType === "permanent" ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-400 uppercase text-[10px]">
                            Your Offer Bid:
                          </span>
                          <span className="text-[#22c55e] font-black text-sm">
                            €{(bidAmount / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <input
                          type="range"
                          min={Math.floor(selectedPlayer.value * 0.5)}
                          max={Math.floor(selectedPlayer.value * 2)}
                          step={
                            Math.floor(selectedPlayer.value * 0.05) || 500000
                          }
                          value={bidAmount}
                          onChange={(e) =>
                            setBidAmount(parseInt(e.target.value))
                          }
                          className="w-full accent-[#22c55e] h-1.5 bg-[#080c14] rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl">
                        <p className="text-[#60a5fa] font-bold text-xs leading-relaxed">
                          You are submitting a loan proposal to{" "}
                          {
                            activeSave.clubs.find(
                              (c) => c.id === selectedPlayer.clubId,
                            )?.name
                          }
                          . If accepted, you will negotiate the percentage of{" "}
                          {selectedPlayer.name}'s weekly wage you are willing to
                          cover.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setBidModalOpen(false)}
                        className="px-5 py-2.5 bg-[#080c14] border border-[#1e2d40] text-slate-400 font-bold rounded-xl hover:text-white transition"
                      >
                        Walk Away
                      </button>
                      <button
                        onClick={submitBid}
                        className="px-6 py-2.5 bg-[#16a34a] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#15803d] transition shadow shadow-[#16a34a]/20"
                      >
                        Submit Offer
                      </button>
                    </div>
                  </div>
                )}

                {bidStep === "contract" && (
                  <div className="flex flex-col gap-6 text-xs">
                    <div className="p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] leading-relaxed font-bold">
                      {negotiationMessage}
                    </div>
                    {contractMessage && (
                      <div className="p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] leading-relaxed font-bold">
                        {contractMessage}
                      </div>
                    )}

                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#1e2d40] pb-1.5">
                      Propose Personal Terms
                    </h4>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">
                          Offered Weekly Wage:
                        </span>
                        <span className="text-[#22c55e] font-black">
                          €{(offeredWage / 1000).toFixed(0)}k/week
                        </span>
                      </div>
                      <input
                        type="range"
                        min={Math.floor(selectedPlayer.wage * 0.7)}
                        max={Math.floor(selectedPlayer.wage * 2.5)}
                        step={1000}
                        value={offeredWage}
                        onChange={(e) =>
                          setOfferedWage(parseInt(e.target.value))
                        }
                        className="w-full accent-[#22c55e] h-1.5 bg-[#080c14] rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-slate-400">
                        Contract Length:
                      </span>
                      <div className="flex gap-2">
                        {offerType === "loan" ? (
                          <div className="flex-1 py-2.5 text-center rounded-xl font-bold bg-[#3b82f6] text-white">
                            1 Season (Loan)
                          </div>
                        ) : (
                          [1, 2, 3, 4, 5].map((yr) => (
                            <button
                              key={yr}
                              onClick={() => setContractYears(yr)}
                              className={`flex-1 py-2.5 rounded-xl font-bold border transition ${contractYears === yr ? "bg-[#22c55e] border-[#22c55e] text-white shadow" : "bg-[#080c14] border-[#1e2d40] text-slate-400 hover:text-white"}`}
                            >
                              {yr}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setBidModalOpen(false)}
                        className="px-5 py-2.5 bg-[#080c14] border border-[#1e2d40] text-slate-400 font-bold rounded-xl hover:text-white transition"
                      >
                        Walk Away
                      </button>
                      <button
                        onClick={submitContract}
                        className="px-6 py-2.5 bg-[#16a34a] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#15803d] transition shadow shadow-[#16a34a]/20"
                      >
                        Offer Contract
                      </button>
                    </div>
                  </div>
                )}

                {bidStep === "accepted" && (
                  <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-center text-[#22c55e] shadow shadow-[#22c55e]/10">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Transfer Completed!
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      {selectedPlayer.name} has signed the papers and is now a
                      member of your squad.
                    </p>
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="px-8 py-3 bg-[#16a34a] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#15803d] transition mt-4"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "squad" && (
          <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Your Squad Transfer Status
            </h2>
            <div className="bg-[#0a0f1e] rounded-xl border border-[#1e2d40] overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1e2d40] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Player</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">OVR</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d40]">
                  {activeSave.players
                    .filter((p) => p.clubId === activeSave.selectedClubId)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#0f1623]">
                        <td className="p-4 font-bold text-white">{p.name}</td>
                        <td className="p-4">{p.position}</td>
                        <td className="p-4">{p.overall}</td>
                        <td className="p-4">
                          €{(p.value / 1000000).toFixed(2)}M
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${p.isTransferListed ? "bg-amber-500/20 text-amber-500" : "bg-slate-800 text-slate-400"}`}
                          >
                            {p.isTransferListed ? "Listed" : "Not Listed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Transfer History
            </h2>
            {activeSave.transfersHistory &&
            activeSave.transfersHistory.length > 0 ? (
              <div className="bg-[#0a0f1e] rounded-xl border border-[#1e2d40] overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#1e2d40] text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Player</th>
                      <th className="p-4">From</th>
                      <th className="p-4">To</th>
                      <th className="p-4">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2d40]">
                    {activeSave.transfersHistory.map((t, idx) => (
                      <tr key={idx} className="hover:bg-[#0f1623]">
                        <td className="p-4">{t.date}</td>
                        <td className="p-4 font-bold text-white">
                          {t.playerName}
                        </td>
                        <td className="p-4 text-rose-400">{t.fromClubName}</td>
                        <td className="p-4 text-emerald-400">{t.toClubName}</td>
                        <td className="p-4 font-bold">
                          €{(t.fee / 1000000).toFixed(2)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 font-bold">
                No transfer history recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
}
