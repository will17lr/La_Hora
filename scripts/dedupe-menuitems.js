const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
    const col = mongoose.connection.db.collection('menuitems');

    // 1) S'assurer que 'key' est bien calculée partout
    await col.updateMany(
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

    // 2) Lister les groupes en doublon par 'key'
    const dups = await col.aggregate([
      { $group: { _id: '$key', ids: { $push: '$_id' }, docs: { $push: '$$ROOT' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (!dups.length) {
      console.log('✅ Aucun doublon.');
      process.exit(0);
    }

    console.log(`⚠️ Doublons trouvés: ${dups.length}`);

    // 3) Pour chaque groupe, garder le "meilleur" doc et supprimer le reste
    const ops = [];
    for (const g of dups) {
      // Heuristique de sélection : disponible d'abord, puis le plus récent
      const sorted = g.docs.sort((a, b) => {
        const avA = a.available ? 1 : 0;
        const avB = b.available ? 1 : 0;
        if (avB !== avA) return avB - avA;
        const tA = (a.updatedAt || a.createdAt || a._id.getTimestamp()).getTime?.() || 0;
        const tB = (b.updatedAt || b.createdAt || b._id.getTimestamp()).getTime?.() || 0;
        return tB - tA;
      });
      const keep = sorted[0]._id;
      const toDelete = g.ids.filter(id => id.toString() !== keep.toString());
      if (toDelete.length) {
        ops.push({ deleteMany: { filter: { _id: { $in: toDelete } } } });
      }
    }

    if (ops.length) {
      const res = await col.bulkWrite(ops, { ordered: false });
      console.log('🧹 Dédoublonnage:', res.result || res);
    } else {
      console.log('Rien à supprimer.');
    }

    console.log('✅ Terminé. Relance maintenant la création de l’index unique (key).');
    process.exit(0);
  } catch (e) {
    console.error('❌ Erreur dédoublonnage:', e);
    process.exit(1);
  }
})();
