/* eslint-disable */
import { SaveState, NewsArticle } from "../db/storage";

const JOURNALISTS = [
  { name: "Fabrizio Romano", handle: "@FabrizioRomano" },
  { name: "David Ornstein", handle: "@David_Ornstein" },
  { name: "Sky Sports News", handle: "@SkySportsNews" },
  { name: "The Athletic FC", handle: "@TheAthleticFC" },
  { name: "GafferGuru", handle: "@GafferGuru_Official" },
  { name: "FootyInsider", handle: "@FootyInsider247" }
];

const GENERAL_TWEETS = [
  "Spotted: {PLAYER} enjoying some downtime at the Monaco Grand Prix. Fans hoping he's staying focused on the pitch!",
  "Exclusive: {PLAYER} is set to launch his own fashion label next month. Expanding his brand off the pitch.",
  "Rumours circulating that {CLUB} are looking to expand their stadium capacity by 10,000 seats following recent ticket demand.",
  "What a season we are having so far. The tactical battles in the {LEAGUE} have been absolutely fascinating.",
  "{PLAYER} signs massive new boot deal with Nike. The numbers involved are astronomical.",
  "Behind the scenes: Tensions are reportedly high in the {CLUB} dressing room after the latest training session.",
  "A lot of talk about the manager of {CLUB} recently. The board are fully backing him, but the fans are divided."
];

const DRAMA_TWEETS = [
  "🚨 EXCLUSIVE: Understand {PLAYER} is increasingly unhappy at {CLUB}. A January exit is a real possibility if things don't change.",
  "Told that {PLAYER} had a heated exchange with the coaching staff at {CLUB} today. Atmosphere is toxic right now. 😳",
  "It's an open secret in the {CLUB} dressing room that {PLAYER} wants out. He feels the project isn't matching his ambition.",
  "Sources close to {PLAYER} say he is 'frustrated' with his current role at {CLUB}. Watch this space."
];

const TRANSFER_RUMOR_TWEETS = [
  "🚨 Here we go soon? Top European clubs are monitoring {PLAYER} from {CLUB}. His recent form has caught the eye of scouts.",
  "Keep an eye on {PLAYER}. The {CLUB} star is attracting serious interest from multiple Champions League sides.",
  "Understand that {PLAYER} is refusing to sign a new deal at {CLUB}. Several top tier teams are preparing bids.",
  "Scouts from massive clubs were in attendance to watch {PLAYER} play for {CLUB} this weekend. A massive bid could arrive soon."
];

export function generateWeeklyNews(state: SaveState): NewsArticle[] {
  const newArticles: NewsArticle[] = [];
  const currentMatchday = state.currentMatchday;
  const playerClub = state.clubs.find(c => c.id === state.selectedClubId)!;

  const getRandomJournalist = () => JOURNALISTS[Math.floor(Math.random() * JOURNALISTS.length)];
  const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 1. Process Actual Transfers (from history)
  const recentTransfers = state.transfersHistory.filter(t => t.matchday === currentMatchday);
  recentTransfers.forEach(transfer => {
    const journalist = getRandomJournalist();
    newArticles.push({
      id: `news_${Date.now()}_${Math.random()}`,
      author: journalist.name,
      handle: journalist.handle,
      content: `🚨 DONE DEAL: ${transfer.playerName} joins ${transfer.toClubName} from ${transfer.fromClubName} for a fee of €${(transfer.fee / 1000000).toFixed(1)}M! Medical completed and contract signed. ✍️✅`,
      likes: getRandomNumber(10000, 150000),
      type: "transfer",
      date: `Matchday ${currentMatchday}`
    });
  });

  // 2. Scan for Drama (Unhappy Players)
  // Get all players across all clubs, find some with low morale
  const unhappyPlayers = state.players.filter(p => p.morale < 50);
  if (unhappyPlayers.length > 0) {
    // Pick up to 2 unhappy players to tweet about
    const maxDrama = Math.min(2, unhappyPlayers.length);
    for (let i = 0; i < maxDrama; i++) {
      const player = unhappyPlayers[i];
      const club = state.clubs.find(c => c.id === player.clubId);
      if (club) {
        const journalist = getRandomJournalist();
        const template = DRAMA_TWEETS[Math.floor(Math.random() * DRAMA_TWEETS.length)];
        const content = template.replace("{PLAYER}", player.name).replace("{CLUB}", club.name);
        
        newArticles.push({
          id: `news_${Date.now()}_${Math.random()}`,
          author: journalist.name,
          handle: journalist.handle,
          content,
          likes: getRandomNumber(2000, 45000),
          type: "drama",
          date: `Matchday ${currentMatchday}`
        });
      }
    }
  }

  // 3. Scan for Transfer Rumors (High performers / high potential)
  const hotProspects = state.players.filter(p => p.overall >= 80 && p.age <= 23);
  if (hotProspects.length > 0) {
    const prospect = hotProspects[Math.floor(Math.random() * hotProspects.length)];
    const club = state.clubs.find(c => c.id === prospect.clubId);
    if (club) {
      const journalist = getRandomJournalist();
      const template = TRANSFER_RUMOR_TWEETS[Math.floor(Math.random() * TRANSFER_RUMOR_TWEETS.length)];
      const content = template.replace("{PLAYER}", prospect.name).replace("{CLUB}", club.name);
      
      newArticles.push({
        id: `news_${Date.now()}_${Math.random()}`,
        author: journalist.name,
        handle: journalist.handle,
        content,
        likes: getRandomNumber(15000, 80000),
        type: "transfer",
        date: `Matchday ${currentMatchday}`
      });
    }
  }

  // 4. Competition / League News
  // Mention the top team
  if (state.standings && state.standings[playerClub.league]) {
    const topTeamId = state.standings[playerClub.league][0].clubId;
    const topTeam = state.clubs.find(c => c.id === topTeamId);
    if (topTeam) {
      const journalist = getRandomJournalist();
      newArticles.push({
        id: `news_${Date.now()}_${Math.random()}`,
        author: journalist.name,
        handle: journalist.handle,
        content: `What a run of form for ${topTeam.name} in the ${playerClub.league}. They are looking completely unstoppable at the top of the table. Can anyone catch them? 🏆🔥`,
        likes: getRandomNumber(5000, 30000),
        type: "competition",
        date: `Matchday ${currentMatchday}`
      });
    }
  }

  // 5. General Flavor text
  if (Math.random() > 0.5) {
    const randomPlayer = state.players[Math.floor(Math.random() * state.players.length)];
    const randomClub = state.clubs[Math.floor(Math.random() * state.clubs.length)];
    const journalist = getRandomJournalist();
    const template = GENERAL_TWEETS[Math.floor(Math.random() * GENERAL_TWEETS.length)];
    const content = template
      .replace("{PLAYER}", randomPlayer.name)
      .replace("{CLUB}", randomClub.name)
      .replace("{LEAGUE}", randomClub.league);

    newArticles.push({
      id: `news_${Date.now()}_${Math.random()}`,
      author: journalist.name,
      handle: journalist.handle,
      content,
      likes: getRandomNumber(500, 12000),
      type: "general",
      date: `Matchday ${currentMatchday}`
    });
  }

  // Shuffle the new articles
  newArticles.sort(() => Math.random() - 0.5);

  return newArticles;
}
