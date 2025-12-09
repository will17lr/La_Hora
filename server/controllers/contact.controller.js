// 📁 server/controllers/contact.controller.js

const Contact = require('../models/Contact');
const mailerService = require('../services/mail.service');

// Helpers
const trim  = (v) => (typeof v === 'string' ? v.trim() : '');
const isEmail = (e) => /^\S+@\S+\.\S+$/.test(trim(e));
const clamp = (s, max) => (typeof s === 'string' && s.length > max ? s.slice(0, max) : s);

// GET /contact
function getContactPage(req, res, next) {
  try {
    return res.status(200).render('pages/contact', { title: 'Contact — La Hora' });
  } catch (err) {
    return next(err);
  }
}

// POST /contact
async function postContact(req, res, next) {
  try {
    const { name, email, phone, subject, message, website } = req.body || {};

    // Honeypot anti-spam
    if (website && String(website).trim().length > 0) {
      return res.redirect(303, '/confirmation?type=contact');
    }

    // Normalisation
    const payload = {
      firstname: trim(name),
      lastname: "",
      email: trim(email),
      phone: trim(phone),
      subject: clamp(trim(subject), 140),
      message: clamp(trim(message), 4000),
      date: new Date().toISOString(),
    };

    // Validation
    if (!isEmail(payload.email) || !payload.message) {
      return res.status(400).render('pages/contact', {
        title: 'Contact — La Hora',
        error: 'Merci de renseigner au minimum un e-mail valide et un message.',
        form: payload,
      });
    }

    // ✔ Sauvegarde MongoDB
    try {
      await Contact.create({
        name: payload.firstname,
        email: payload.email,
        phone: payload.phone,
        subject: payload.subject,
        message: payload.message,
      });

      console.log('[contact] message saved');
    } catch (dbErr) {
      console.warn('[contact] MongoDB save failed:', dbErr.message);
    }

    // ✔ Notification admin via mail.service.js
    try {
      await mailerService.notifyAdminContact(payload);
    } catch (mailErr) {
      console.warn('[contact] email admin failed:', mailErr.message);
    }

    return res.redirect(303, '/confirmation?type=contact');

  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getContactPage,
  postContact,
};
