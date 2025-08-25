require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../../../data/messages.json');
const nodemailer = require('nodemailer');


router.get('/', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact – La Hora',
    success: req.query.success === '1'
  });
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const newMessage = { name, email, subject, message, date: new Date().toISOString() };

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: 'contact@lahora.fr',
      subject,
      text: message
    });

    const existingData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath))
      : [];

    existingData.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.redirect('/contact?success=1');
  } catch (err) {
    console.error("Erreur contact :", err.message);
    res.status(500).send("Une erreur est survenue lors de l'envoi du message.");
  }
});

module.exports = router;
