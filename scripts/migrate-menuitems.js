const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('../server/models/MenuItem');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const single = await db.collection('menuitems').findOne({});
    if (!single) {
      console.log('❌ Aucun document trouvé dans menuitems');
      process.exit(1);
    }

    const out = [];

    // helper
    const pushItems = (periodKey, block) => {
      for (const [category, arr] of Object.entries(block || {})) {
        for (const p of arr) {
          out.push({
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            image: p.image || '',
            period: periodKey,     // 'matin' ou 'soir'
            category,              // ex: 'softs', 'cocktails', ...
            available: true,
          });
        }
      }
    };

    pushItems('matin', single.matin);
    pushItems('soir',  single.soir);

    // ⚠️ Purge et réinsert
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(out);

    console.log(`✅ Migration OK : ${out.length} produits`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
})();
