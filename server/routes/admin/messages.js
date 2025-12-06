// server/routes/admin/messages.js
const router = require("express").Router();
const requireAdmin = require("../../middlewares/requireAdmin");
const Contact = require("../../models/Contact");
const mongoose = require("mongoose");

// LISTE DES MESSAGES
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/messages", {
      layout: "partials/layout-admin",
      title: "Messages — La Hora",
      messages,
      adminEmail: req.session.admin.email,
    });
  } catch (err) {
    console.error("[admin/messages] GET error:", err);
    next(err);
  }
});

// DÉTAIL D’UN MESSAGE
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("ID invalide");
    }

    const message = await Contact.findById(id).lean();
    if (!message) {
      return res.status(404).send("Message introuvable");
    }

    res.render("admin/message-detail", {
      layout: "partials/layout-admin",
      title: "Message — La Hora",
      message,
      adminEmail: req.session.admin.email,
    });
  } catch (err) {
    console.error("[admin/messages] DETAIL error:", err);
    next(err);
  }
});

// SUPPRESSION
router.post("/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await Contact.findByIdAndDelete(id);
    } else {
      console.warn("[admin/messages] Suppression ignorée : ID invalide");
    }

    res.redirect("/admin/messages");
  } catch (err) {
    console.error("[admin/messages] DELETE error:", err);
    next(err);
  }
});

module.exports = router;
