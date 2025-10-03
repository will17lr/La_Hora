// server/services/fileStore.js
const fs = require('fs/promises');
const path = require('path');

async function readJSON(relPath) {
  const p = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function writeJSON(relPath, data) {
  const p = path.join(process.cwd(), relPath);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJSON, writeJSON };
