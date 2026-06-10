const fs = require('fs');
const realSquads = JSON.parse(fs.readFileSync('src/config/realSquads.json', 'utf8'));

// Instead of parsing TS, just use the keys from realSquads to see how many we have.
// Let's check how many total clubs in realSquads have 0 players.
let totalClubs = Object.keys(realSquads).length;
let emptyClubs = 0;
for (const clubId in realSquads) {
    if (realSquads[clubId].length === 0) {
        emptyClubs++;
        console.log("Empty club: " + clubId);
    }
}
console.log(`Total clubs: ${totalClubs}, Empty: ${emptyClubs}`);
