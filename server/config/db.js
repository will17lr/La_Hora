// server/config/db.js
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  const isProd = process.env.NODE_ENV === 'production';

  try {
    await mongoose.connect(uri, {
      // Si l'URI contient déjà /lahora, pas besoin de { dbName }
      autoIndex: !isProd,                 // crée les index auto en dev, pas en prod
      maxPoolSize: 10,                    // taille du pool de connexions
      serverSelectionTimeoutMS: 10000,    // time-out de sélection serveur
      appName: 'LaHoraApp',               // visible dans Atlas
    });

    isConnected = true;
    console.log(`✅ MongoDB connecté : ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Écouteurs utiles
    mongoose.connection.on('error', (err) => {
      console.error('🚨 Mongo error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB déconnecté');
    });
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB :', error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  console.log('🛑 MongoDB déconnecté proprement');
}

// Arrêt propre (Ctrl+C / kill)
process.on('SIGINT', async () => { await disconnectDB(); process.exit(0); });
process.on('SIGTERM', async () => { await disconnectDB(); process.exit(0); });

module.exports = { connectDB, disconnectDB };
