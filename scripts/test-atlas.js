// scripts/test-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI manquant');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Ping MongoDB Atlas OK');
    process.exit(0);
  } catch (e) {
    console.error('❌ Connexion KO:', e.message);
    process.exit(1);
  }
})();
