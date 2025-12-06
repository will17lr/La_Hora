// server/controllers/contact.controller.js

const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmails');

// ---------- Helpers ----------
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
      name:    clamp(trim(name), 100),
      email:   trim(email),
      phone:   clamp(trim(phone), 40),
      subject: clamp(trim(subject), 140),
      message: clamp(trim(message), 4000),
      date:    new Date().toISOString(),
    };

    // Validation
    if (!isEmail(payload.email) || !payload.message) {
      return res.status(400).render('pages/contact', {
        title: 'Contact — La Hora',
        error: 'Merci de renseigner au minimum un e-mail valide et un message.',
        form: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          subject: payload.subject,
          message: payload.message
        },
      });
    }

    // ===== MongoDB save =====
    try {
      await Contact.create({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        subject: payload.subject,
        message: payload.message,
      });

      console.log('[contact] message saved to MongoDB');
    } catch (dbErr) {
      console.warn('[contact] MongoDB save failed:', dbErr.message);
      // On continue malgré tout vers l'envoi de mail
    }

    // ===== Envoi d'email via sendEmail.js =====
    try {
      const subj = payload.subject
        ? `[Contact] ${payload.subject}`
        : `Nouveau message — ${payload.name || payload.email}`;

      const text =
`Message :
${payload.message}

— ${payload.name || 'Anonyme'}
Email : ${payload.email}${payload.phone ? ` | Tél : ${payload.phone}` : ''}
Date : ${payload.date}`;

      await sendEmail({
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: subj,
        text,
        // html: text.replace(/\n/g, '<br/>') // Option HTML
      });

      console.log('[contact] Email envoyé via sendEmail.js');

    } catch (mailErr) {
      console.warn('[contact] email delivery failed:', mailErr.message);
      // Pas de blocage : on redirige quand même
    }

    // ===== Succès =====
    return res.redirect(303, '/confirmation?type=contact');

  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getContactPage,
  postContact,
};
