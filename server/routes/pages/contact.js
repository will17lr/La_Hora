const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const router = express.Router();

const filePath = path.join(__dirname, '../../../data/reservations.json');

router.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact – La Hora' });
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const newMessage = { name, email, subject, message, date: new Date().toISOString() };

  try {
    // 1. Envoyer l'email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou 'outlook', 'smtp.orange.fr', etc.
      auth: {
        user: 'votreemail@gmail.com',
        pass: 'votre_mot_de_passe_app'
      }
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: 'contact@lahora.fr', // destination réelle
      subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    // 2. Enregistrement dans reservations.json
    const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
    existingData.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.redirect('/contact');
  } catch (err) {
    console.error("Erreur contact :", err.message);
    res.status(500).send("Une erreur est survenue lors de l'envoi du message.");
  }
});

module.exports = router;
