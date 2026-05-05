// server/routes/admin/auth.js
const express = require("express");
const router = express.Router();
const Admin = require("../../models/Admin");
const bcrypt = require("bcrypt");

function safeAdminRedirect(next) {
  if (typeof next !== "string" || next.trim() === "") return "/admin";
  if (!next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

// GET login
router.get("/login", (req, res) => {
  res.render("admin/login", {
    error: null,
    emailTyped: "",
    next: req.query.next || "",
  });
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password, next } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render("admin/login", {
        error: "Identifiants incorrects",
        emailTyped: email,
        next,
      });
    }

    const ok = await bcrypt.compare(password, admin.password);

    if (!ok) {
      return res.render("admin/login", {
        error: "Identifiants incorrects",
        emailTyped: email,
        next,
      });
    }

    req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    };

    return res.redirect(safeAdminRedirect(next));

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Erreur serveur");
  }
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;
