const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../../data/carte.json');

// GET - Afficher l'interface
router.get('/', (req, res) => {
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture carte');
    const carte = JSON.parse(data);
    res.render('admin/carte', { carte });
  });
});

// POST - Ajouter un produit
router.post('/add', (req, res) => {
  const { category, nom, description, prix } = req.body;
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    const carte = err ? {} : JSON.parse(data);
    carte[category] = carte[category] || [];
    carte[category].push({ nom, description, prix: parseFloat(prix) });

    fs.writeFile(dataPath, JSON.stringify(carte, null, 2), err => {
      if (err) return res.status(500).send('Erreur sauvegarde');
      res.redirect('/admin/carte');
    });
  });
});

// TODO : routes pour modifier/supprimer
module.exports = router;
