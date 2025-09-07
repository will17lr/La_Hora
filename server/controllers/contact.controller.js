// server/controllers/contact.controller.js
// Contact page + form processing (safe, with optional mail & JSON persistence)

const path = require('path');
const fs = require('fs/promises');

let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch { /* nodemailer non installé : ok */ }

// ===== Options via .env (toutes facultatives) =====
// MAIL_ENABLED=true
// MAIL_HOST=smtp.example.com
// MAIL_PORT=587
// MAIL_SECURE=false          // true pour 465
// MAIL_USER=xxxx
// MAIL_PASS=xxxx
// MAIL_FROM="La Hora <no-reply@lahora.fr>"
// MAIL_TO=contact@lahora.fr
//
// CONTACT_SAVE_JSON=true     // pour sauvegarder dans /server/data/messages.json

// ===== Helpers =====
const trim = (v) => (typeof v === 'string' ? v.trim() : '');
const isEmail = (e) => /^\S+@\S+\.\S+$/.test(trim(e));
const clamp = (s, max) => (typeof s === 'string' && s.length > max ? s.slice(0, max) : s);

// Petit répertoire de sauvegarde JSON (si activé)
const DATA_DIR = path.join(__dirname, '../../data');
const MESSAGES_JSON = path.join(DATA_DIR, 'messages.json');

// ===== GET /contact =====
function getContactPage(req, res, next) {
  try {
    return res.status(200).render('pages/contact', { title: 'Contact — La Hora' });
  } catch (err) {
    return next(err);
  }
}

// ===== POST /contact =====
async function postContact(req, res, next) {
  try {
    // Champs attendus (+ un honeypot facultatif "website")
    const { name, email, phone, subject, message, website } = req.body || {};

    // Anti-spam simple : si le champ "website" (caché dans le formulaire) est rempli → on renvoie succès silencieux
    if (website && String(website).trim().length > 0) {
      return res.redirect('/confirmation?type=contact');
    }

    // Normalisation & coupe des champs trop longs (évite payload énormes)
    const payload = {
      name:    clamp(trim(name), 100),
      email:   trim(email),
      phone:   clamp(trim(phone), 40),
      subject: clamp(trim(subject), 140),
      message: clamp(trim(message), 4000),
      date:    new Date().toISOString(),
      ip:      req.ip,
      ua:      req.get('user-agent') || '',
    };

    // Validation minimale
    if (!isEmail(payload.email) || !payload.message) {
      return res.status(400).render('pages/contact', {
        title: 'Contact — La Hora',
        error: 'Merci de renseigner au minimum un e-mail valide et un message.',
        form: { name: payload.name, email: payload.email, phone: payload.phone, subject: payload.subject, message: payload.message },
      });
    }

    // ===== Option: Envoi d’email (si activé et nodemailer dispo) =====
    if (process.env.MAIL_ENABLED === 'true' && nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT || 587),
          secure: String(process.env.MAIL_SECURE || 'false') === 'true', // true = 465
          auth: (process.env.MAIL_USER && process.env.MAIL_PASS)
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
            : undefined,
        });

        const from = process.env.MAIL_FROM || `"La Hora" <no-reply@lahora.fr>`;
        const to   = process.env.MAIL_TO   || 'contact@lahora.fr';
        const subj = payload.subject
          ? `[Contact] ${payload.subject}`
          : `Nouveau message — ${payload.name || payload.email}`;

        const text =
`Message:
${payload.message}

— ${payload.name || 'Anonyme'}
Email: ${payload.email}${payload.phone ? ` | Tel: ${payload.phone}` : ''}
Date: ${payload.date}
IP: ${payload.ip}
UA: ${payload.ua}`;

        await transporter.sendMail({
          from, to,
          subject: subj,
          text,
        });
      } catch (mailErr) {
        // On log mais on n’empêche pas l’utilisateur d’avoir sa confirmation
        console.warn('[contact] email delivery failed:', mailErr.message);
      }
    }

    // ===== Option: Persistance JSON (si activée) =====
    if (process.env.CONTACT_SAVE_JSON === 'true') {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        let arr = [];
        try {
          const raw = await fs.readFile(MESSAGES_JSON, 'utf8');
          arr = JSON.parse(raw);
          if (!Array.isArray(arr)) arr = [];
        } catch {
          arr = [];
        }
        arr.push({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          subject: payload.subject,
          message: payload.message,
          date: payload.date,
        });
        await fs.writeFile(MESSAGES_JSON, JSON.stringify(arr, null, 2), 'utf8');
      } catch (fsErr) {
        console.warn('[contact] JSON persistence failed:', fsErr.message);
      }
    }

    // ✅ Succès → Confirmation type=contact
    return res.redirect(303, '/confirmation?type=contact');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getContactPage,
  postContact,
};
