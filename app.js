// app.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { logger } = require('./server/middlewares/logger.middleware');
const { connectDB } = require('./server/config/db.js');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;

// ───────────────────────────────
// Sécurité HTTPS (production)
// ───────────────────────────────
if (isProd) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(`https://${req.headers.host}${req.url}`);
  });
}

app.disable('x-powered-by');

// ───────────────────────────────
// Parsers
// ───────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// ───────────────────────────────
// Logs
// ───────────────────────────────
if (!isProd) app.use(logger);

// ───────────────────────────────
// Sécurité & compression prod
// ───────────────────────────────
if (isProd) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression({ threshold: 1024 }));
}

// ───────────────────────────────
// Fichiers statiques
// ───────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), isProd ? {
  maxAge: '7d',
  etag: true,
  immutable: true,
} : undefined));

// ───────────────────────────────
// EJS + layouts
// ───────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'partials/layout');
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
app.set('layout extractMeta', true);

// ───────────────────────────────
// Sessions
// ───────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24 * 7,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 2,
  },
}));

app.use(flash());

// Locals accessibles globalement
app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.isAdmin = !!req.session?.admin;
  res.locals.adminEmail = req.session?.admin?.email || null;
  next();
});

// ───────────────────────────────
// MAILER SERVICE CENTRALISÉ (NOUVEAU)
// ───────────────────────────────
const mailerService = require("./server/services/mail.service");
app.locals.mailerService = mailerService;

// ───────────────────────────────
// Routes
// ───────────────────────────────

// Auth admin (non protégé)
const adminAuthRoutes = require('./server/routes/admin/auth');

// Middleware admin global
const requireAdmin = require('./server/middlewares/requireAdmin');

// Admin pages (protégées)
const adminDashboardRoutes = require('./server/routes/admin/dashboard');
const adminCarteRoutes = require('./server/routes/admin/carte');
const adminReservationsRoutes = require('./server/routes/admin/reservations');
const adminMessagesRoutes = require('./server/routes/admin/messages');

// Pages publiques
app.use('/', require('./server/routes/pages/index'));
app.use('/about', require('./server/routes/pages/about'));
app.use('/contact', require('./server/routes/pages/contact'));
app.use('/event', require('./server/routes/pages/event'));
app.use('/carte', require('./server/routes/pages/carte'));
app.use('/carte-selection', require('./server/routes/pages/carteSelection'));
app.use('/reservation', require('./server/routes/pages/reservation'));
app.use('/confirmation', require('./server/routes/pages/confirmation'));

// Admin public (login/logout)
app.use('/admin', adminAuthRoutes);

// Admin sécurisé
app.use('/admin', requireAdmin, adminDashboardRoutes);
app.use('/admin/carte', requireAdmin, adminCarteRoutes);
app.use('/admin/reservations', requireAdmin, adminReservationsRoutes);
app.use('/admin/messages', requireAdmin, adminMessagesRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).render('pages/500', { title: 'Erreur serveur' });
});

// Lancement du serveur
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () =>
      console.log(`Serveur lancé sur http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Erreur connexion MongoDB:', err.message);
    process.exit(1);
  }
})();
