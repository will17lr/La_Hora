const requireAdmin = require("../../middlewares/requireAdmin");
const router = require("express").Router();
const Reservation = require("../../models/Reservation");

// Fonction de normalisation
function normalize(r) {
  return {
    date: r.date ?? "",
    heure: r.heure ?? r.time ?? "",
    nom: r.nom ?? r.lastname ?? "",
    prenom: r.prenom ?? r.firstname ?? "",
    personnes: Number.isFinite(r.personnes)
      ? r.personnes
      : parseInt(r.people || "0", 10) || 0,
    telephone: r.telephone ?? r.phone ?? "",
    email: r.email ?? "",
    message: r.message ?? "",
    _id: r._id?.toString(),
    createdAt: r.createdAt,
  };
}

// Liste des réservations (Admin)
router.get("/", requireAdmin, async (req, res) => {
  const docs = await Reservation.find().sort({ createdAt: -1 }).lean();
  const reservations = docs.map(normalize);

  const now = new Date();
  const aVenir = reservations.filter((r) => {
    const d = new Date(`${r.date}T${r.heure || "00:00"}`);
    return !Number.isNaN(d.getTime()) && d >= now;
  }).length;

  const kpis = {
    total: reservations.length,
    aVenir,
  };

  res.render("admin/reservations", {
    layout: "partials/layout-admin",
    title: "Réservations",
    kpis,
    reservations,
    adminEmail: req.session.admin.email,
  });
});

// Suppression par _id
router.post("/:id/delete", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (id) {
    try {
      await Reservation.findByIdAndDelete(id);
    } catch (e) {
      console.error("Erreur suppression réservation :", e);
    }
  }

  res.redirect("/admin/reservations");
});

module.exports = router;
