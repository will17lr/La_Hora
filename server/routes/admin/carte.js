// server/routes/admin/carte.js
const router = require("express").Router();
const requireAdmin = require("../../middlewares/requireAdmin");

const CarteItem = require("../../models/CarteItem");
const {
  getCarteAdmin,
  getCarteByMoment,
  saveProduct,
  deleteProduct
} = require("../../services/carte.service");

// LISTE ADMIN — regroupée par catégories
router.get("/", requireAdmin, async (req, res) => {
  const carte = await getCarteAdmin();

  res.render("admin/Carte", {
    layout: "partials/layout-admin",
    title: "Gestion de la carte",
    carte,
    adminEmail: req.session.admin.email,
  });
});

// PAGE AJOUT
router.get("/add", requireAdmin, async (req, res) => {
  res.render("admin/carte-detail", {
    layout: "partials/layout-admin",
    title: "Ajouter un produit",
    product: null,
    moments: ["matin", "soir"],
    categories: [
      "petitdejeuner",
      "chaudes",
      "sirops",
      "softs",
      "bieres",
      "cocktails",
      "alcool",
      "tapas"
    ],
  });
});

// PAGE EDITION
router.get("/edit/:id", requireAdmin, async (req, res) => {
  const product = await CarteItem.findById(req.params.id).lean();

  res.render("admin/carte-detail", {
    layout: "partials/layout-admin",
    title: "Modifier un produit",
    product,
    moments: ["matin", "soir"],
    categories: [
      "petitdejeuner",
      "chaudes",
      "sirops",
      "softs",
      "bieres",
      "cocktails",
      "alcool",
      "tapas"
    ],
  });
});

// SAVE (AJOUT + EDITION)
router.post("/save", requireAdmin, async (req, res) => {
  const { id, name, description, price, image, category, moment, order } = req.body;

  if (id) {
    await CarteItem.findByIdAndUpdate(id, {
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      moment,
      order: parseInt(order || 0),
    });
  } else {
    await CarteItem.create({
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      moment,
      order: parseInt(order || 0),
    });
  }

  res.redirect("/admin/carte");
});

// DELETE
router.post("/delete/:id", requireAdmin, async (req, res) => {
  await deleteProduct(req.params.id);
  res.redirect("/admin/carte");
});

module.exports = router;
