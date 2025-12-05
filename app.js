// app.js
require('dotenv').config();
console.log('[ENV CHECK]',
  'ADMIN_EMAIL=', (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '(none)'),
  'HASH_SET=', !!(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.startsWith('$2'))
);

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');           // ← NEW

const { connectDB } = require('./server/config/db.js');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;

// ── Sécurité de base
app.disable('x-powered-by');
if (isProd) {
  app.set((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(`https://${req.headers.host}${req.url}`);
  });
  }

// ── Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));                           // ← NEW (support PUT/DELETE via formulaires)

// ── Logs (dev)
const { logger } = require('./server/middlewares/logger.middleware');
if (!isProd) {
  app.use(logger);
  app.use(morgan('dev'));
}

// ── Sécu & perf (prod)
if (isProd) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression({ threshold: 1024 }));
}

// ── Statique
app.use(express.static(path.join(__dirname, 'public'), isProd ? {
  maxAge: '7d',
  etag: true,
  immutable: true,
} : undefined));

// ── Vues (EJS + layouts)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'partials/layout');
app.locals.title = 'La Hora';
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
app.set('layout extractMeta', true);

// ── Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24 * 7, // 7 jours
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 2, // 2H de session
  },
}));
app.use(flash());

// Locals communs aux vues (flash + infos admin)            // ← UPDATED
app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.user = req.user || null;
  res.locals.isAdmin = !!req.session?.admin;                // défini après login admin
  res.locals.adminEmail = req.session?.admin?.email || null;
  next();
});

// ── Routes (pages publiques)
const indexRoutes = require('./server/routes/pages/index');
const reservationRoutes = require('./server/routes/pages/reservation');
const carteRoutes = require('./server/routes/pages/carte');
const aboutRoutes = require('./server/routes/pages/about');
const contactRoutes = require('./server/routes/pages/contact');
const eventRoutes = require('./server/routes/pages/event');
const carteSelectionRoutes = require('./server/routes/pages/carteSelection');
const confirmationRoutes = require('./server/routes/pages/confirmation');

// ── Admin (auth + dashboard + carte + reservations)
//const { isAuth, isRole } = require('./server/middlewares/auth.middleware');
const adminAuthRoutes = require('./server/routes/admin/auth');     // ← NEW (/admin/login, /admin/logout)
const adminDashboardRoutes = require('./server/routes/admin/dashboard');   // ← NEW (/admin)
const adminCarteRoutes = require('./server/routes/admin/carte');   // ← NEW (/admin/carte)
const adminReservationsRoutes = require('./server/routes/admin/reservations'); // ← Reservation
const requireAdmin = require('./server/middlewares/requireAdmin'); // ← NEW

// Debug simple
app.get('/debug-header', (req, res) => {
  res.render('pages/index', { title: 'Debug Header' });
});

// Login/Logout accessibles sans isAuth                      // ← NEW
app.use('/admin', adminAuthRoutes); // public (login/logout)
// ── Mount admin
// Routes admin protégées (dashboard + carte)                // ← NEW
app.use('/admin', requireAdmin, adminDashboardRoutes);
app.use('/admin/carte', requireAdmin, adminCarteRoutes);
app.use('/admin/reservations', requireAdmin, adminReservationsRoutes);


// ── Mount public
app.use('/', indexRoutes);
app.use('/reservation', reservationRoutes);
app.use('/carte', carteRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/event', eventRoutes);
app.use('/carte-selection', carteSelectionRoutes);
app.use('/confirmation', confirmationRoutes);

// ── 404
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page non trouvée' });
});

// ── Handler d’erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
  res.status(500).render('pages/500', { title: 'Erreur serveur' });
});

// ── Lancement après connexion MongoDB
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`✅ Serveur lancé sur http://localhost:${PORT} (${isProd ? 'prod' : 'dev'})`);
    });
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    process.exit(1);
  }
})();
