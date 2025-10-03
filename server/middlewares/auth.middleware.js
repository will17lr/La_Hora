// server/middlewares/auth.middleware.js

// Ne renvoie qu'un chemin interne sûr (commençant par "/")
function safePath(p, fallback = '/') {
  if (typeof p !== 'string') return fallback;
  // interdit protocole ou //
  if (/^https?:\/\//i.test(p) || p.startsWith('//')) return fallback;
  // n'autorise que des chemins internes
  return p.startsWith('/') ? p : fallback;
}

function isAuth(req, res, next) {
  // ✅ utilisateur normal
  if (req.session?.user) return next();

  // ✅ admin connecté
  if (req.session?.admin) return next();

  // ❌ pas connecté → redirige vers le bon login en conservant la cible
  const isAdminZone = req.originalUrl.startsWith('/admin');
  const loginPath = isAdminZone ? '/admin/login' : '/login';
  const nextParam = encodeURIComponent(safePath(req.originalUrl, isAdminZone ? '/admin' : '/'));
  return res.redirect(`${loginPath}?next=${nextParam}`);
}

/**
 * Autorise l'accès si le rôle courant ∈ roles.
 * - user : vérifie dans user.roles (array)
 * - admin : considéré superuser par défaut (peut bypass), sauf si strictAdminOnly = true
 */
function isRole(...roles) {
  const opts = { strictAdminOnly: false }; // passe à true si tu veux qu'un admin n'accède pas aux routes "manager-only"
  return (req, res, next) => {
    // ✅ utilisateur normal
    if (req.session?.user) {
      const userRoles = Array.isArray(req.session.user.roles) ? req.session.user.roles : [];
      const has = userRoles.some(r => roles.includes(r));
      return has ? next() : res.status(403).render('pages/403');
    }

    // ✅ admin
    if (req.session?.admin) {
      // si l'admin est superuser par défaut
      if (!opts.strictAdminOnly) return next();
      // sinon il doit être explicitement autorisé
      return roles.includes('admin') ? next() : res.status(403).render('pages/403');
    }

    // ❌ personne
    const isAdminZone = req.originalUrl.startsWith('/admin');
    const loginPath = isAdminZone ? '/admin/login' : '/login';
    const nextParam = encodeURIComponent(safePath(req.originalUrl, isAdminZone ? '/admin' : '/'));
    return res.redirect(`${loginPath}?next=${nextParam}`);
  };
}

module.exports = { isAuth, isRole };
