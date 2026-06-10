import { SaveState } from "../db/storage";


export function processGlobalTransfers(save: SaveState): SaveState {
  const matchday = save.currentMatchday;
  const isTransferWindow = (matchday >= 1 && matchday <= 4) || (matchday >= 19 && matchday <= 22);
  
  if (!isTransferWindow) return save;
  
  const newState = { ...save };
  const userClubId = newState.selectedClubId;

  // 1. Generate bids for User's transfer listed players
  const listedPlayers = newState.players.filter(p => p.clubId === userClubId && p.isTransferListed);
  
  listedPlayers.forEach(player => {
    // 30% chance per matchday to get a bid if listed
    if (Math.random() < 0.3) {
      // Find a CPU club that can afford them
      const potentialBuyers = newState.clubs.filter(c => c.id !== userClubId && c.id !== "free_agent");
      if (potentialBuyers.length > 0) {
        const buyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];
        
        // Formulate bid (80% to 110% of player value)
        const bidAmount = Math.floor(player.value * (0.8 + Math.random() * 0.3));
        
        // Prevent duplicate offers for the same player in the same matchday from the same club
        const existingOffer = newState.inbox.find(m => m.subject.includes(player.name) && m.body.includes(buyer.name));
        if (!existingOffer) {
          newState.inbox.unshift({
            id: `offer_${Date.now()}_${player.id}`,
            sender: buyer.name,
            subject: `TRANSFER OFFER: ${player.name}`,
            body: `${buyer.name} has submitted a formal bid of £${(bidAmount / 1000000).toFixed(1)}M for ${player.name}.\n\nDo you accept this offer?\n\n[TRANSFER_OFFER_DATA: {"playerId": "${player.id}", "buyerId": "${buyer.id}", "bidAmount": ${bidAmount}}]`,
            date: `Matchday ${matchday}`,
            read: false,
            type: "transfer",
          });
        }
      }
    }
  });

  // 2. CPU-to-CPU Blockbuster Transfers (Max 1 per matchday during window)
  if (Math.random() < 0.5) { // 50% chance of a blockbuster transfer
    const cpuClubs = newState.clubs.filter(c => c.id !== userClubId);
    const buyer = cpuClubs[Math.floor(Math.random() * cpuClubs.length)];
    const seller = cpuClubs[Math.floor(Math.random() * cpuClubs.length)];
    
    if (buyer.id !== seller.id) {
      // Find a star player at seller club
      const sellerPlayers = newState.players.filter(p => p.clubId === seller.id && p.overall > 82);
      if (sellerPlayers.length > 0) {
        const target = sellerPlayers[Math.floor(Math.random() * sellerPlayers.length)];
        const fee = Math.floor(target.value * (0.9 + Math.random() * 0.4));
        
        // Execute the CPU transfer
        target.clubId = buyer.id;
        
        newState.transfersHistory.unshift({
          id: `trans_cpu_${Date.now()}_${target.id}`,
          playerName: target.name,
          fromClubName: seller.name,
          toClubName: buyer.name,
          fee: fee,
          type: "permanent",
          matchday: matchday
        });
      }
    }
  }

  return newState;
}
