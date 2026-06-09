const fs = require('fs');

let content = fs.readFileSync('src/config/seededData.ts', 'utf8');

// I'll replace the static export const INITIAL_CLUBS = [ ... ] 
// Wait, actually, the easiest way to patch the seeded data is to find every club object and append the new fields before the closing brace.
// Every club object ends with `wageBudget: <number> },` or `wageBudget: <number> }`

content = content.replace(/wageBudget:\s*(\d+)\s*\}/g, (match, wageBudget) => {
  // We'll generate a realistic bank balance based on wage budget (roughly 20-30x weekly wage)
  const bankBalance = parseInt(wageBudget) * 35;
  const ticketPrice = 30 + Math.floor(Math.random() * 40); // 30 to 70 euros
  const stadiumCondition = 60 + Math.floor(Math.random() * 40); // 60 to 100
  
  return `wageBudget: ${wageBudget}, bankBalance: ${bankBalance}, ticketPrice: ${ticketPrice}, stadiumCondition: ${stadiumCondition}, sponsorships: [] }`;
});

fs.writeFileSync('src/config/seededData.ts', content);
console.log("Seeded data patched with financial fields.");
