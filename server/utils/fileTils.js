const fs = require('fs');
const readJSON = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const writeJSON = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

module.exports = { readJSON, writeJSON };
