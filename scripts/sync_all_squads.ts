import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { CLUBS_DATA } from '../src/config/seededData';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processClubsBatch(clubsBatch) {
  const clubNames = clubsBatch.map(c => `${c.name} (ID: ${c.id})`).join(', ');
  const prompt = `You are a football database expert.
Generate the accurate, up-to-date (2024/2025/2026) real-world 25-man squads for the following clubs:
${clubNames}

Ensure recent transfers are included (e.g. Julián Alvarez to Atletico Madrid).
Assign realistic FM-style positions to each player ('GK', 'DEF', 'MID', 'ATT').

Format the output strictly as a JSON object where each key is the club's ID, and the value is an array of 25 player objects. Do not include markdown blocks.
Schema:
{
  "club_id_1": [
    { "id": "club_id_1_r_1", "name": "Player Name", "position": "MID", "nationality": "England" }
  ],
  "club_id_2": [ ... ]
}
`;

  try {
    const responsePromise = ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: { temperature: 0.1 }
    });
    
    // Add 30-second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API Timeout')), 30000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]);

    let raw = response.text;
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error with Gemini for batch:`, error.message || error);
    return null;
  }
}

async function main() {
  const outPath = path.join(__dirname, '..', 'src', 'config', 'realSquads.json');
  let existingData = {};
  if (fs.existsSync(outPath)) {
    try { existingData = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) {}
  }

  const updatedData = { ...existingData };
  
  // Filter clubs that are already successfully synced by Gemini
  const pendingClubs = CLUBS_DATA.filter(club => {
    if (!updatedData[club.id] || updatedData[club.id].length < 20) return true;
    const nat = updatedData[club.id][0].nationality;
    return nat === 'Unknown' || nat === 'Real';
  });

  console.log(`Found ${pendingClubs.length} clubs left to sync.`);

  const BATCH_SIZE = 5;
  for (let i = 0; i < pendingClubs.length; i += BATCH_SIZE) {
    const batch = pendingClubs.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(pendingClubs.length / BATCH_SIZE)}`);
    
    let success = false;
    let delay = 5000;
    while (!success) {
      const result = await processClubsBatch(batch);
      if (result && typeof result === 'object' && Object.keys(result).length > 0) {
        for (const [clubId, squad] of Object.entries(result)) {
          if (Array.isArray(squad) && squad.length > 0) {
            updatedData[clubId] = squad;
            console.log(`Successfully synced ${clubId} (${squad.length} players)`);
          }
        }
        fs.writeFileSync(outPath, JSON.stringify(updatedData, null, 2), 'utf8');
        success = true;
      } else {
        console.log(`Retrying batch in ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 2, 60000); // Max delay 60s
      }
    }
    // Sleep to respect rate limits
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('Finished syncing all clubs!');
}

main();
