// server/routes/admin/reservations.js
const router = require("express").Router();
const requireAdmin = require("../../middlewares/requireAdmin");
const mongoose = require("mongoose");
const Reservation = require("../../models/reservation.model");

// Normalisation pour affichage
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

/* -----------------------------------------
   GET — Liste des réservations
----------------------------------------- */
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const docs = await Reservation.find().sort({ createdAt: -1 }).lean();
    const reservations = docs.map(normalize);

    const now = new Date();
    const aVenir = reservations.filter((r) => {
      const dt = new Date(`${r.date}T${r.time}`);
      return !Number.isNaN(dt.getTime()) && dt >= now;
    }).length;

    const kpis = { total: reservations.length, aVenir };

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

/* -----------------------------------------
   GET — Détail d'une réservation
----------------------------------------- */
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Identifiant invalide.");
      return res.redirect("/admin/reservations");
    }

    const doc = await Reservation.findById(id).lean();
    if (!doc) {
      req.flash("error", "Réservation introuvable.");
      return res.redirect("/admin/reservations");
    }

    res.render("admin/reservation-detail", {
      layout: "partials/layout-admin",
      title: "Détail de la réservation",
      reservation: normalize(doc),
      adminEmail: req.session.admin.email,
    });

  } catch (err) {
    console.error("[admin/reservations DETAIL]", err);
    next(err);
  }
});

/* -----------------------------------------
   POST — CONFIRMER une réservation
----------------------------------------- */
router.post("/:id/confirm", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "ID invalide.");
      return res.redirect("/admin/reservations");
    }

    let reservation = await Reservation.findById(id);
    if (!reservation) {
      req.flash("error", "Réservation introuvable.");
      return res.redirect("/admin/reservations");
    }

    if (reservation.status === "confirmed") {
      req.flash("info", "Cette réservation est déjà confirmée.");
      return res.redirect(`/admin/reservations/${id}`);
    }

    // Mettre à jour et récupérer la version à jour
    reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: "confirmed" },
      { new: true }
    ).lean();

    // Envoi email premium via mailer centralisé
    await req.app.locals.mailerService
      .sendReservationConfirmationAdmin(reservation.email, reservation);

    req.flash("success", "Réservation confirmée et email envoyé.");
    res.redirect(`/admin/reservations/${id}`);

  } catch (err) {
    console.error("[CONFIRM ERROR]", err);
    next(err);
  }
});

/* -----------------------------------------
   POST — SUPPRIMER une réservation
----------------------------------------- */
router.post("/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      await Reservation.findByIdAndDelete(id);
      req.flash("success", "Réservation supprimée.");
    } else {
      console.warn("Suppression ignorée : id invalide =", id);
      req.flash("error", "Impossible de supprimer : identifiant invalide.");
    }

    res.redirect("/admin/reservations");
  } catch (err) {
    console.error("[admin/reservations DELETE]", err);
    next(err);
  }
});

module.exports = router;
