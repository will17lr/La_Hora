// server/routes/admin/carte.js
const router = require('express').Router();
const { getCarte, upsertProduct, deleteProduct } = require('../../services/carte.service');

// Liste & formulaire
router.get('/', async (req, res) => {
  const carte = await getCarte();
  res.render('admin/carte', {
    layout: 'partials/layout-admin',
    title: 'Gestion de la carte',
    carte,
  });
});

// Ajout
router.post('/product', async (req, res) => {
  const { moment, categorie, name, description, price, image } = req.body;
  await upsertProduct({
    moment,
    categorie,
    product: { name, description, price: parseFloat(price), image },
  });
  res.redirect('/admin/carte');
});

// Edition (par index)
router.post('/product/:moment/:categorie/:index', async (req, res) => {
  const { moment, categorie, index } = req.params;
  const { name, description, price, image } = req.body;
  await upsertProduct({
    moment,
    categorie,
    index: parseInt(index, 10),
    product: { name, description, price: parseFloat(price), image },
  });
  res.redirect('/admin/carte');
});

// Suppression
router.post('/product/:moment/:categorie/:index/delete', async (req, res) => {
  const { moment, categorie, index } = req.params;
  await deleteProduct({ moment, categorie, index: parseInt(index, 10) });
  res.redirect('/admin/carte');
});

module.exports = router;
