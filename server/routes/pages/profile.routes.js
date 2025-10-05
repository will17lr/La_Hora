// server/routes/pages/profile.routes.js
const router = require('express').Router();
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

router.get('/profil', requireAuth, ctrl.profile);              // user connecté requis
router.post('/employe', requireRole(['employee']), ctrl.save); // rôle employé requis
module.exports = router;
