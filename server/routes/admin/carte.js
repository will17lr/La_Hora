// server/routes/admin/carte.js
const router = require("express").Router();
const requireAdmin = require("../../middlewares/requireAdmin");
const { getCarte, upsertProduct, deleteProduct } = require("../../services/carte.service");

// LISTE + FORMULAIRE
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const carte = await getCarte();

    res.render("admin/carte", {
      layout: "partials/layout-admin",
      title: "Gestion de la carte",
      carte,
      adminEmail: req.session.admin.email,
    });
  } catch (err) {
    console.error("[admin/carte GET]", err);
    next(err);
  }
});

// AJOUT
router.post("/product", requireAdmin, async (req, res, next) => {
  try {
    const { moment, categorie, name, description, price, image } = req.body;

    await upsertProduct({
      moment: moment?.trim(),
      categorie: categorie?.trim(),
      product: {
        name: name?.trim(),
        description: description?.trim(),
        price: parseFloat(price) || 0,
        image: image?.trim(),
      },
    });

    res.redirect("/admin/carte");
  } catch (err) {
    console.error("[admin/carte ADD]", err);
    next(err);
  }
});

// EDITION
router.post("/product/:moment/:categorie/:index", requireAdmin, async (req, res, next) => {
  try {
    const { moment, categorie, index } = req.params;
    const { name, description, price, image } = req.body;

    await upsertProduct({
      moment,
      categorie,
      index: parseInt(index, 10),
      product: {
        name: name?.trim(),
        description: description?.trim(),
        price: parseFloat(price) || 0,
        image: image?.trim(),
      },
    });

    res.redirect("/admin/carte");
  } catch (err) {
    console.error("[admin/carte EDIT]", err);
    next(err);
  }
});

// SUPPRESSION
router.post("/product/:moment/:categorie/:index/delete", requireAdmin, async (req, res, next) => {
  try {
    const { moment, categorie, index } = req.params;

    await deleteProduct({
      moment,
      categorie,
      index: parseInt(index, 10),
    });

    res.redirect("/admin/carte");
  } catch (err) {
    console.error("[admin/carte DELETE]", err);
    next(err);
  }
});

module.exports = router;
