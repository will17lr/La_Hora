// scripts/sync-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('../server/models/menu.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
    const before = await MenuItem.collection.getIndexes();
    console.log('Indexes AVANT :', Object.keys(before));

    const res = await MenuItem.syncIndexes(); // crée/supprime pour matcher le schéma
    console.log('syncIndexes ->', res);

    const after = await MenuItem.collection.getIndexes();
    console.log('Indexes APRÈS  :', Object.keys(after));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
