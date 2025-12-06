// server/routes/admin/dashboard.js
const requireAdmin = require("../../middlewares/requireAdmin");
const router = require("express").Router();
const { getRecap } = require("../../services/recap.service");

// Dashboard admin
router.get("/", requireAdmin, async (req, res) => {
  const { reservations, contacts } = await getRecap();

  const kpis = {
    reservations: reservations.length,
    messages: contacts.length,
  };

  res.render("admin/dashboard", {
    layout: "partials/layout-admin",
    title: "Dashboard",
    kpis,
    reservations,
    contacts,
    adminEmail: req.session.admin.email,
  });
});

module.exports = router;
