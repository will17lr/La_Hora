// scripts/export-menu.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('../server/models/menu.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
    const rows = await MenuItem.find().sort({ period: 1, category: 1, name: 1 }).lean();

    const outDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const file = path.join(outDir, `menuitems-${new Date().toISOString().slice(0,10)}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf-8');

    console.log(`✅ Exporté ${rows.length} items → ${file}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ export error:', e);
    process.exit(1);
  }
})();
