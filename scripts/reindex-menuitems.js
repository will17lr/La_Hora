// node scripts/reindex-menuitems.js
const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('../server/models/menu.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
    const col = MenuItem.collection;

    // 1) Backfill du champ `key` (period:category:name en lower-case)
    const upd = await col.updateMany(
      {},
      [
        {
          $set: {
            key: {
              $toLower: {
                $concat: [
                  { $ifNull: ['$period', ''] }, ':',
                  { $ifNull: ['$category', ''] }, ':',
                  { $trim: { input: { $ifNull: ['$name', ''] } } }
                ]
              }
            }
          }
        }
      ]
    );
    console.log(`Backfill 'key' -> matched: ${upd.matchedCount}, modified: ${upd.modifiedCount}`);

    // 2) Drop de l'ancien index unique { period:1, category:1, name:1 } s'il existe
    const indexesBefore = await col.getIndexes();
    const compositeName = Object.keys(indexesBefore).find(idxName => {
      const k = indexesBefore[idxName].key || indexesBefore[idxName];
      return k && k.period === 1 && k.category === 1 && k.name === 1;
    });
    if (compositeName) {
      try {
        await col.dropIndex(compositeName);
        console.log(`Dropped old composite index: ${compositeName}`);
      } catch (e) {
        console.warn(`Drop composite index failed (${compositeName}):`, e.message);
      }
    } else {
      console.log('No composite {period,category,name} index found.');
    }

    // 3) Créer le NOUVEL index unique sur `key`
    try {
      await col.createIndex({ key: 1 }, { unique: true, sparse: true });
      console.log('Created unique index on key');
    } catch (e) {
      if (e.code === 11000) {
        console.error('❌ Duplicates found for key. Résous les doublons puis relance.');
      } else {
        console.error('Create index error:', e.message);
      }
      process.exit(1);
    }

    // 4) (Optionnel) Synchroniser les autres index définis dans le schéma
    const res = await MenuItem.syncIndexes();
    console.log('syncIndexes:', res);

    const indexesAfter = await col.getIndexes();
    console.log('Indexes now:', Object.keys(indexesAfter));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
