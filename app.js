// app.js
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');

// ⚡ MongoDB
const dotenv = require('dotenv');
dotenv.config();
const { connectDB } = require('./server/config/db.js');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Petites sécurités globales
app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1); // si hébergé derrière un proxy (Render/Railway/Nginx)

// === Middlewares généraux ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Sécurité & perf (activés en prod uniquement)
if (isProd) {
  // Helmet (CSP désactivée pour ne pas bloquer tes scripts inline actuels)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression gzip/deflate pour les réponses > 1 Ko
  app.use(compression({ threshold: 1024 }));
}

// Static files (mets-le APRÈS compression pour compresser aussi le statique côté serveur)
app.use(express.static(path.join(__dirname, 'public'), isProd ? {
  maxAge: '7d',   // cache navigateur
  etag: true,
  immutable: true
} : undefined));

// === View engine (EJS + layouts) ===
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.locals.title = 'La Hora';
app.set('layout', 'partials/layout');

// === Routes (import) ===
const indexRoutes = require('./server/routes/pages/index');
const reservationRoutes = require('./server/routes/pages/reservation');
const carteRoutes = require('./server/routes/pages/carte');
const aboutRoutes = require('./server/routes/pages/about');
const contactRoutes = require('./server/routes/pages/contact');
const eventRoutes = require('./server/routes/pages/event');
const carteSelectionRoutes = require('./server/routes/pages/carteSelection');

const adminReservationRoutes = require('./server/routes/admin/reservations');
const adminCarteRoutes = require('./server/routes/admin/carte');

// === Debug page ===
app.get('/debug-header', (req, res) => {
  res.render('pages/index', { title: 'Debug Header' });
});

// === Routes pages ===
app.use('/', indexRoutes);
app.use('/reservation', reservationRoutes);
app.use('/carte', carteRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/event', eventRoutes);
app.use('/carte-selection', carteSelectionRoutes);

// === Routes API ===
app.use('/api/admin/carte', adminCarteRoutes);
app.use('/api/admin/reservations', adminReservationRoutes);

// === 404 + erreurs ===
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page non trouvée' });
});
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
  res.status(500).render('pages/500', { title: 'Erreur serveur' });
});

// === Lancement avec connexion DB ===
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);   // ✅ connexion Mongo
    app.listen(PORT, () => {
      console.log(`✅ Serveur lancé sur http://localhost:${PORT} (${isProd ? 'prod' : 'dev'})`);
    });
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    process.exit(1);
  }
})();
