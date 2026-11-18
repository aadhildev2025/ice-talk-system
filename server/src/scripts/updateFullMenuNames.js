const fs = require('fs');
const path = require('path');

const replacements = [
  { cat: 'BIRIYANI (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Biriyani (Portion)' },
  { cat: 'BIRIYANI (PORTION ONLY)', from: 'Beef (Portion)', to: 'Beef Biriyani (Portion)' },
  { cat: 'BIRIYANI (PORTION ONLY)', from: 'Mutton (Portion)', to: 'Mutton Biriyani (Portion)' },
  { cat: 'BIRIYANI (PORTION ONLY)', from: 'Prawn (Portion)', to: 'Prawn Biriyani (Portion)' },
  { cat: 'BIRIYANI (PORTION ONLY)', from: 'Fish (Portion)', to: 'Fish Biriyani (Portion)' },

  { cat: 'DEVILED (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Deviled Chicken (Portion)' },
  { cat: 'DEVILED (PORTION ONLY)', from: 'Beef (Portion)', to: 'Deviled Beef (Portion)' },
  { cat: 'DEVILED (PORTION ONLY)', from: 'Prawn (Portion)', to: 'Deviled Prawn (Portion)' },
  { cat: 'DEVILED (PORTION ONLY)', from: 'Cuttle Fish (Portion)', to: 'Deviled Cuttle Fish (Portion)' },
  { cat: 'DEVILED (PORTION ONLY)', from: 'Fish (Portion)', to: 'Deviled Fish (Portion)' },
  { cat: 'DEVILED (PORTION ONLY)', from: 'Mix (Portion)', to: 'Deviled Mix (Portion)' },

  { cat: 'GHEE FRIED RICE (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Ghee Fried Rice (Portion)' },
  { cat: 'GHEE FRIED RICE (PORTION ONLY)', from: 'Beef (Portion)', to: 'Beef Ghee Fried Rice (Portion)' },
  { cat: 'GHEE FRIED RICE (PORTION ONLY)', from: 'Sea Food (Portion)', to: 'Sea Food Ghee Fried Rice (Portion)' },
  { cat: 'GHEE FRIED RICE (PORTION ONLY)', from: 'Mix (Portion)', to: 'Mix Ghee Fried Rice (Portion)' },

  { cat: 'CHOPSUEY RICE (PORTION ONLY)', from: 'Vegetable (Portion)', to: 'Vegetable Chopsuey Rice (Portion)' },
  { cat: 'CHOPSUEY RICE (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Chopsuey Rice (Portion)' },
  { cat: 'CHOPSUEY RICE (PORTION ONLY)', from: 'Sea Food (Portion)', to: 'Sea Food Chopsuey Rice (Portion)' },

  { cat: 'CHOPSUEY NOODLES (PORTION ONLY)', from: 'Vegetable (Portion)', to: 'Vegetable Chopsuey Noodles (Portion)' },
  { cat: 'CHOPSUEY NOODLES (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Chopsuey Noodles (Portion)' },
  { cat: 'CHOPSUEY NOODLES (PORTION ONLY)', from: 'Sea Food (Portion)', to: 'Sea Food Chopsuey Noodles (Portion)' },

  { cat: 'HAWAIIAN KOTTU (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Hawaiian Kottu (Portion)' },
  { cat: 'HAWAIIAN KOTTU (PORTION ONLY)', from: 'Mix (Portion)', to: 'Mix Hawaiian Kottu (Portion)' },

  { cat: 'PEPPER KOTTU (PORTION ONLY)', from: 'Chicken (Portion)', to: 'Chicken Pepper Kottu (Portion)' },
  { cat: 'PEPPER KOTTU (PORTION ONLY)', from: 'Beef (Portion)', to: 'Beef Pepper Kottu (Portion)' },
  { cat: 'PEPPER KOTTU (PORTION ONLY)', from: 'Mix (Portion)', to: 'Mix Pepper Kottu (Portion)' },
];

function updateFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    // Look ahead 10 lines to see if there is a matching name and category
    for (const r of replacements) {
      const nameMatch = lines[i].includes(`"name": "${r.from}"`) || lines[i].includes(`name: '${r.from}'`);
      if (nameMatch) {
        // Check following 8 lines for category
        let hasCat = false;
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          if (lines[j].includes(r.cat)) {
            hasCat = true;
            break;
          }
        }
        if (hasCat) {
          lines[i] = lines[i].replace(r.from, r.to);
          count++;
          break;
        }
      }
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`[Update] ${filePath}: Replaced ${count} items.`);
}

const targetFiles = [
  path.join(__dirname, '../data/restaurantMenu.js'),
  path.join(__dirname, '../../../client/src/data/restaurantMenu.js'),
  path.join(__dirname, 'generateAndSyncMenu.js'),
];

targetFiles.forEach(updateFile);
