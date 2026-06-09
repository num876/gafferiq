const fs = require('fs');

// 1. Fix transfers/page.tsx — state declarations inside function
let transfers = fs.readFileSync('src/app/game/transfers/page.tsx', 'utf8');

// Find the state declarations inside openBidModal and delete them (they're at lines 162-181)
const insideFunc = `
    // Modal / Interaction states
    const [scoutedPlayer, setScoutedPlayer] = useState<Player | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [bidStep, setBidStep] = useState<
      "bid" | "negotiating" | "contract" | "declined" | "accepted"
    >("bid");
    const [offerType, setOfferType] = useState<"permanent" | "loan">(
      "permanent",
    );
    const [negotiationMessage, setNegotiationMessage] = useState("");
    const [suggestedFee, setSuggestedFee] = useState<number>(0);

    // Contract offer state
    const [contractYears, setContractYears] = useState<number>(3);
    const [offeredWage, setOfferedWage] = useState<number>(0);
    const [contractMessage, setContractMessage] = useState("");

    const [reviewingPlayer, setReviewingPlayer] = useState<Player | null>(null);

    if (!activeSave) return null;

    const playerClub = activeSave.clubs.find(
      (c) => c.id === activeSave.selectedClubId,
    )!;`;

if (transfers.includes(insideFunc)) {
  transfers = transfers.replace(insideFunc, `
    if (!activeSave) return null;
    const playerClub = activeSave.clubs.find(
      (c) => c.id === activeSave.selectedClubId,
    )!;`);
  console.log('Removed duplicate state from openBidModal');
} else {
  console.log('State block not found, skipping');
}

fs.writeFileSync('src/app/game/transfers/page.tsx', transfers);
console.log('Done');
