// server/routes/pages/contact.js
const express = require('express');
const router = express.Router();
const { getContactPage, postContact } = require('../../controllers/contact.controller');

// Afficher la page contact
router.get('/', getContactPage);

// Soumettre le formulaire (POST /contact)
router.post('/', postContact);

module.exports = router;
