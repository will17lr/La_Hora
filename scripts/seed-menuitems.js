// scripts/seed-menuitems.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const MenuItem = require(path.join(__dirname, '../server/models/menu.model'));

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI manquant dans .env'); process.exit(1);
  }

  await mongoose.connect(uri);

  // Quelques items "matin" et "soir" pour valider l’UI
  const seed = [
    // MATIN
    { moment: 'matin', category: 'petitdejeuner', name: 'Croissant', description: 'Pur beurre croustillant', price: 1.5, image: '/assets/img/petit-dejeuner.jpg' },
    { moment: 'matin', category: 'chaudes', name: 'Café', description: 'Expresso ou allongé', price: 1.2, image: '/assets/img/cafe.jpg' },
    { moment: 'matin', category: 'chaudes', name: 'Thé', description: 'Thé vert/noir, infusion', price: 2.0, image: '/assets/img/the.jpg' },

    // SOIR
    { moment: 'soir', category: 'cocktails', name: 'Mojito', description: 'Menthe fraîche, citron vert', price: 8.0, image: '/assets/img/mojitoFraise.jpg' },
    { moment: 'soir', category: 'cocktails', name: 'Expresso Martini', description: 'Vodka, café, liqueur', price: 9.0, image: '/assets/img/expressoMartini.jpg' },
    { moment: 'soir', category: 'softs', name: 'Sirop à l’eau', description: 'Menthe, grenadine, citron', price: 2.0, image: '/assets/img/soft.jpg' },
    { moment: 'soir', category: 'bieres', name: 'Bière blonde 25cl', description: 'Pression', price: 3.5, image: '/assets/img/bierelicorne.png' },
    { moment: 'soir', category: 'tapas', name: 'Patatas bravas', description: 'Sauce brava maison', price: 6.0, image: '/assets/img/tapas.jpg' },
  ];

  // ✅ nouveau (met à jour les champs à chaque seed)
const ops = seed.map(it => ({
  updateOne: {
    filter: { moment: it.moment, category: it.category, name: it.name },
    update: {
      $set: {
        description: it.description,
        price: it.price,
        image: it.image,
        available: true
      },
      $setOnInsert: {
        moment: it.moment,
        category: it.category,
        name: it.name
      }
    },
    upsert: true
  }
}));

  const res = await MenuItem.bulkWrite(ops);
  console.log('✅ Seed OK :', JSON.stringify(res.result || res, null, 2));

  await mongoose.disconnect();
}

run().catch(e => { console.error('❌ Seed erreur:', e); process.exit(1); });
