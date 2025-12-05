module.exports = function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    const nextUrl = encodeURIComponent(req.originalUrl || "/admin");
    return res.redirect(`/admin/login?next=${nextUrl}`);
  }
  next();
};
