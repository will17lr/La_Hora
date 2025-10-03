// server/routes/admin/index.js
const router = require('express').Router();
const { getRecap } = require('../../services/recap.service');

// Dashboard admin
router.get('/', async (req, res) => {
  const { reservations, contacts } = await getRecap();

  const kpis = {
    reservations: reservations.length,
    messages: contacts.length,
  };

  res.render('admin/dashboard', {
    layout: 'partials/layout-admin',
    title: 'Dashboard',
    kpis, reservations, contacts,
    adminEmail: req.session?.admin?.email || null,
  });
});

module.exports = router;
