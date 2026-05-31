const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processBatch(playersBatch, clubId) {
  const prompt = `You are a football database expert (like Football Manager or EAFC).
Below is a list of real players for club ID: ${clubId}.
Assign realistic 2024/2025 ratings for each player. 
The OVR (overall) and Potential should be between 1-99.
Provide these exact 8 attributes: pace, shooting, passing, dribbling, defending, physical, mental, stamina. (All between 1-99).

Format the output strictly as a JSON array of objects. Do not include markdown blocks or any other text.
Schema:
[
  {
    "id": "player_id",
    "baseOverall": 85,
    "potential": 90,
    "attributes": {
      "pace": 88, "shooting": 85, "passing": 80, "dribbling": 86, "defending": 40, "physical": 82, "mental": 78, "stamina": 84
    }
  }
]

Input Players:
${JSON.stringify(playersBatch.map(p => ({ id: p.id, name: p.name, position: p.position })), null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let raw = response.text;
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error with Gemini:", error);
    return [];
  }
}

async function main() {
  const filePath = path.join(__dirname, '..', 'src', 'config', 'realSquads.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updatedData = {};

  for (const clubId in data) {
    console.log(`Processing club: ${clubId}`);
    const squad = data[clubId];
    updatedData[clubId] = [];

    // Process in batches of 15 to avoid token limits
    for (let i = 0; i < squad.length; i += 15) {
      const batch = squad.slice(i, i + 15);
      const generatedStats = await processBatch(batch, clubId);

      for (const player of batch) {
        const stats = generatedStats.find(s => s.id === player.id);
        if (stats) {
          updatedData[clubId].push({
            ...player,
            baseOverall: stats.baseOverall,
            potential: stats.potential,
            attributes: stats.attributes
          });
        } else {
          // Fallback if AI missed one
          updatedData[clubId].push({
            ...player,
            baseOverall: 75,
            potential: 80,
            attributes: {
              pace: 75, shooting: 75, passing: 75, dribbling: 75, defending: 75, physical: 75, mental: 75, stamina: 75
            }
          });
        }
      }
    }
  }

  const outPath = path.join(__dirname, '..', 'src', 'config', 'realSquads_with_ratings.json');
  fs.writeFileSync(outPath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('Finished writing realSquads_with_ratings.json!');
}

main();
