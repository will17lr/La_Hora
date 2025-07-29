// app.js
const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// ✅ Vérifie bien que tous ces fichiers existent et exportent un router :
const indexRoutes = require('./server/routes/pages/index');
const reservationRoutes = require('./server/routes/pages/reservation');
const carteRoutes = require('./server/routes/pages/carte');
const aboutRoutes = require('./server/routes/pages/about');
const contactRoutes = require('./server/routes/pages/contact');
const eventRoutes = require('./server/routes/pages/event')
const adminReservationRoutes = require('./server/routes/admin/reservations');
const adminCarteRoutes = require('./server/routes/admin/carte');

// ✅ Vérifie bien que tous ces fichiers existent et exportent un router :
app.get('/debug-header', (req, res) => {
  res.render('pages/index', { title: 'Debug Header' });
});

// Routes use (toujours des objets de type router ici)
app.use('/', indexRoutes);
app.use('/reservation', reservationRoutes);
app.use('/carte', carteRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/event', eventRoutes);
app.use('/admin/carte', adminCarteRoutes);
app.use('/admin/reservations', adminReservationRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page non trouvée' });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
