// server/routes/admin/reservations.js
const router = require("express").Router();
const requireAdmin = require("../../middlewares/requireAdmin");
const mongoose = require("mongoose");

// ⚠️ Le bon modèle
const Reservation = require("../../models/reservation.model");

// Normalisation pour la vue admin
function normalize(r) {
  return {
    _id: r._id.toString(),
    date: r.date,
    time: r.time,
    firstname: r.firstname,
    lastname: r.lastname,
    phone: r.phone,
    email: r.email,
    people: r.people,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  };
}

// GET — Liste des réservations
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const docs = await Reservation.find().sort({ createdAt: -1 }).lean();
    const reservations = docs.map(normalize);

    // Calcul : réservations à venir
    const now = new Date();
    const aVenir = reservations.filter((r) => {
      const dt = new Date(`${r.date}T${r.time}`);
      return !Number.isNaN(dt.getTime()) && dt >= now;
    }).length;

    const kpis = {
      total: reservations.length,
      aVenir,
    };

    res.render("admin/reservations", {
      layout: "partials/layout-admin",
      title: "Réservations",
      reservations,
      kpis,
      adminEmail: req.session.admin.email,
    });
  } catch (err) {
    console.error("[admin/reservations GET]", err);
    next(err);
  }
});

// POST — Suppression
router.post("/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      await Reservation.findByIdAndDelete(id);
    } else {
      console.warn("Suppression ignorée : id invalide =", id);
    }

    res.redirect("/admin/reservations");
  } catch (err) {
    console.error("[admin/reservations DELETE]", err);
    next(err);
  }
});

module.exports = router;
