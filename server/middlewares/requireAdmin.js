// server/middlewares/requireAdmin.js
module.exports = function requireAdmin(req, res, next) {
  const admin = req.session?.admin;

  // Pas connecté → redirection vers login admin
  if (!admin) {
    const nextUrl = encodeURIComponent(req.originalUrl || "/admin");
    return res.redirect(`/admin/login?next=${nextUrl}`);
  }

  // Optionnel : rôle superadmin/admin si tu veux plus tard
  // if (admin.role !== "admin" && admin.role !== "superadmin") {
  //   return res.status(403).render("pages/403");
  // }

  next();
};
