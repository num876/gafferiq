import { Club, Player, generateAllClubsWithSquads, calculateValue } from "../config/seededData";

export interface Manager {
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  favoriteFormation: string;
  avatar: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    shirtColor: string;
  };
  attributes: {
    tacticalKnowledge: number;
    manManagement: number;
    motivation: number;
    scouting: number;
    negotiation: number;
  };
  reputation: number; // 1-100 (Sunday League to World Class)
  reputationLabel: string;
  playingStyle: string;
  bio: string;
  aiImageUrl?: string;
  winCount: number;
  drawCount: number;
  lossCount: number;
  goalsScored: number;
  titlesWon: number;
  achievements: string[];
}

export interface MatchFixture {
  id: string;
  league: string;
  matchday: number;
  homeClubId: string;
  awayClubId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  events?: MatchEvent[];
  stats?: MatchStats;
  playerRatings?: Record<string, number>;
  motmId?: string;
  tacticalAnalysis?: string;
  pressQuote?: string;
}

export interface MatchEvent {
  minute: number;
  type: "Goal" | "Shot Saved" | "Yellow Card" | "Red Card" | "Injury" | "Substitution" | "Penalty" | "VAR Check" | "Big Chance Missed";
  clubId: string;
  playerName: string;
  assistName?: string;
  details: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  offsides: { home: number; away: number };
}

export interface Standing {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  type: "board" | "player" | "media";
  actionRequired?: boolean;
  options?: { label: string; action: string; effect: string }[];
  selectedOption?: string;
}

export interface ScoutTask {
  id: string;
  playerName: string;
  playerClub: string;
  playerClubId: string;
  playerRating: number;
  position: string;
  scoutId: string;
  daysRemaining: number;
  completed: boolean;
}

export interface NewsArticle {
  id: string;
  author: string;
  handle: string;
  content: string;
  likes: number;
  type: "transfer" | "drama" | "competition" | "general";
  date: string; // Matchday relative
}

export interface SaveState {
  id: string;
  saveName: string;
  manager: Manager;
  selectedClubId: string;
  currentSeason: number;
  currentMatchday: number;
  transferBudget: number;
  wageBudget: number;
  boardConfidence: number;
  clubs: Club[];
  players: Player[];
  fixtures: MatchFixture[];
  standings: Record<string, Standing[]>; // standings grouped by league name
  inbox: InboxMessage[];
  newsFeed: NewsArticle[];
  scoutingTasks: ScoutTask[];
  scoutShortlist: string[]; // player IDs
  transfersHistory: Array<{
    id: string;
    playerName: string;
    fromClubName: string;
    toClubName: string;
    fee: number;
    type: "permanent" | "loan";
    matchday: number;
  }>;
  tactics?: {
    formation: string;
    instructions: any; // Using any here to avoid circular imports or redefining TacticalInstructions, we know it will be TacticalInstructions
    starters: string[]; // Player IDs
    bench: string[]; // Player IDs
  };
  tacticalPresets?: Record<number, {
    formation: string;
    tactics: any;
  }>;
  transferWindowOpen: boolean;
  difficulty: "Quick Sim" | "Detailed Sim";
  gameLog: string[];
}

// Circle Method algorithm to schedule fixtures
export function generateFixturesForLeague(clubs: Club[], league: string): MatchFixture[] {
  const leagueClubs = clubs.filter(c => c.league === league);
  const n = leagueClubs.length;
  const fixtures: MatchFixture[] = [];
  const rounds = (n - 1) * 2; // Home and Away rounds

  const list = [...leagueClubs];

  let idCounter = 1;

  for (let r = 0; r < rounds; r++) {
    const isSecondHalf = r >= n - 1;
    const roundNumber = r + 1;
    const activeRound = isSecondHalf ? r - (n - 1) : r;

    for (let i = 0; i < n / 2; i++) {
      let homeIdx = (activeRound + i) % (n - 1);
      let awayIdx = (activeRound - i + n - 1) % (n - 1);

      if (i === 0) {
        homeIdx = n - 1;
      }

      let home = list[homeIdx];
      let away = list[awayIdx];

      // Swap home and away for alternating rounds or in the second half
      if ((activeRound + i) % 2 === 1) {
        const temp = home;
        home = away;
        away = temp;
      }

      if (isSecondHalf) {
        const temp = home;
        home = away;
        away = temp;
      }

      fixtures.push({
        id: `${league.toLowerCase()}_m_${roundNumber}_f_${idCounter++}`,
        league,
        matchday: roundNumber,
        homeClubId: home.id,
        awayClubId: away.id,
        homeScore: null,
        awayScore: null,
        played: false
      });
    }
  }

  return fixtures;
}

export function createNewSave(saveName: string, manager: Manager, clubId: string, speed: "Quick Sim" | "Detailed Sim"): SaveState {
  const { clubs, players } = generateAllClubsWithSquads();
  const selectedClub = clubs.find(c => c.id === clubId)!;

  // Generate fixtures for all 5 leagues
  const leagues: Club["league"][] = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  let allFixtures: MatchFixture[] = [];
  for (const l of leagues) {
    const leagueClubs = clubs.filter(c => c.league === l);
    allFixtures.push(...generateFixturesForLeague(leagueClubs, l));
  }

  // Initialize Standings
  const standings: Record<string, Standing[]> = {};
  for (const l of leagues) {
    const leagueClubs = clubs.filter(c => c.league === l);
    standings[l] = leagueClubs.map(c => ({
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
  }

  // Setup Initial Inbox Message from Board
  const initialInbox: InboxMessage[] = [
    {
      id: "board_welcome",
      sender: "Club Board of Directors",
      subject: "Welcome to the club!",
      body: `Dear Manager ${manager.lastName},

We are thrilled to welcome you as our new head coach. Your playing style (${manager.playingStyle}) and tactical approach align with our goals. 

For this season, the board expects you to match the status of our club and establish a stable position in the table. We have provided you with a transfer budget of €${(selectedClub.transferBudget / 1000000).toFixed(1)}M and a wage budget of €${(selectedClub.wageBudget / 1000).toFixed(0)}k/week.

Good luck! We will monitor your performance closely.

Regards,
The Board`,
      date: "Pre-Season",
      read: false,
      type: "board"
    }
  ];

  return {
    id: `save_${Date.now()}`,
    saveName,
    manager,
    selectedClubId: clubId,
    currentSeason: 1,
    currentMatchday: 1,
    transferBudget: selectedClub.transferBudget,
    wageBudget: selectedClub.wageBudget,
    boardConfidence: 75,
    clubs,
    players,
    fixtures: allFixtures,
    standings,
    inbox: initialInbox,
    newsFeed: [],
    scoutingTasks: [],
    scoutShortlist: [],
    transfersHistory: [],
    transferWindowOpen: true,
    difficulty: speed,
    gameLog: ["Save file created. Pre-season training commenced."]
  };
}

const LOCAL_STORAGE_KEY = "gaffer_iq_saves";

export function loadAllSaves(): SaveState[] {
  if (typeof window === "undefined") return [];
  const savesJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savesJSON) return [];
  try {
    return JSON.parse(savesJSON);
  } catch (e) {
    console.error("Failed to parse save games", e);
    return [];
  }
}

export function saveGame(state: SaveState): void {
  if (typeof window === "undefined") return;
  const currentSaves = loadAllSaves();
  const index = currentSaves.findIndex(s => s.id === state.id);
  
  if (index !== -1) {
    currentSaves[index] = state;
  } else {
    currentSaves.push(state);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentSaves));
}

export function deleteSave(saveId: string): void {
  if (typeof window === "undefined") return;
  const currentSaves = loadAllSaves();
  const updated = currentSaves.filter(s => s.id !== saveId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}
