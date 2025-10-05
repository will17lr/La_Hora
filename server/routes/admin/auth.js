// server/routes/admin/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');

const normEmail = (s) => (s || '').trim().toLowerCase();
const getAdminEmail = () => normEmail(process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '');

// 🚧 anti open-redirect
function safePath(p, fallback = '/admin') {
  if (typeof p !== 'string') return fallback;
  if (/^https?:\/\//i.test(p) || p.startsWith('//')) return fallback;
  return p.startsWith('/') ? p : fallback;
}

// IMPORTANT : choisis un layout qui existe (sinon mets false pour tester)
const LAYOUT = 'partials/layout'; // ou 'partials/layout-admin' SI ce fichier existe bien

router.get('/login', (req, res) => {
  try {
    const next = safePath(req.query?.next || '', '/admin'); // preserve next si present
    return res.render('admin/login', {
      layout: LAYOUT,
      title: 'Connexion admin',
      error: null,
      next,            // ✅ attendu par login.ejs
      emailTyped: ''   // ✅ attendu par login.ejs
    });
  } catch (e) {
    console.error('[ADMIN GET /login]', e);
    // Option: désactive le layout pour isoler si c'est le layout qui casse
    return res.status(500).render('admin/login', {
      layout: false,
      title: 'Connexion admin',
      error: "Erreur d'affichage de la page de connexion.",
      next: '',
      emailTyped: ''
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, next } = req.body;

  const adminEmail = getAdminEmail();
  const okEmail = normEmail(email) === adminEmail;

  const hash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  const okPass = hash ? await bcrypt.compare(String(password ?? ''), hash) : false;

  if (okEmail && okPass) {
    req.session.admin = { email: adminEmail, role: 'admin', at: Date.now() };
    return res.redirect(next || '/admin');
  }

  return res.status(401).render('admin/login', {
    layout: 'partials/layout-admin',
    title: 'Connexion admin',
    error: 'Identifiants invalides.',
    next,
    emailTyped: email || ''
  });a
});


router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

module.exports = router;
