// server/controllers/contact.controller.js
// Contact page + form processing (EMAIL_* + JSON optional)

const path = require('path');
const fs = require('fs/promises');
let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch { /* nodemailer non installé */ }

// ---------- Helpers ----------
const trim  = (v) => (typeof v === 'string' ? v.trim() : '');
const isEmail = (e) => /^\S+@\S+\.\S+$/.test(trim(e));
const clamp = (s, max) => (typeof s === 'string' && s.length > max ? s.slice(0, max) : s);

// ---------- JSON persistence (facultatif) ----------
const DATA_DIR = path.join(__dirname, '../../data');
const MESSAGES_JSON = path.join(DATA_DIR, 'messages.json');

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

    // Honeypot anti-spam : si rempli → succès silencieux
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

    // ===== Envoi d’e-mail (EMAIL_* — activé si host + user + pass) =====
    const MAIL_HOST   = process.env.EMAIL_HOST;
    const MAIL_PORT   = Number(process.env.EMAIL_PORT || 587);
    const MAIL_SECURE = String(process.env.EMAIL_SECURE || 'false') === 'true'; // true => 465
    const MAIL_USER   = process.env.EMAIL_USER;
    const MAIL_PASS   = process.env.EMAIL_PASS;
    const MAIL_FROM   = process.env.EMAIL_FROM || `"La Hora" <${MAIL_USER}>`;
    const MAIL_TO     = process.env.EMAIL_TO   || MAIL_USER;

    const MAIL_ENABLED = Boolean(MAIL_HOST && MAIL_USER && MAIL_PASS);

    if (MAIL_ENABLED && nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: MAIL_HOST,
          port: MAIL_PORT,
          secure: MAIL_SECURE,
          auth: { user: MAIL_USER, pass: MAIL_PASS },
        });

        // Vérification non bloquante (log en warning si échec)
        await transporter.verify().catch(e => console.warn('[contact] SMTP verify:', e.message));

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

        const info = await transporter.sendMail({
          from: MAIL_FROM,
          to: MAIL_TO,
          subject: subj,
          text,
          // html: text.replace(/\n/g, '<br/>'), // active si besoin d’HTML
        });

        console.log('[contact] mail envoyé:', info.messageId);
      } catch (mailErr) {
        console.warn('[contact] email delivery failed:', mailErr.code || '', mailErr.message);
        // On continue quand même vers la confirmation.
      }
    } else {
      console.log('[contact] envoi mail désactivé (variables EMAIL_* manquantes)');
    }

    // ===== Persistance JSON locale (si activée) =====
    if (process.env.CONTACT_SAVE_JSON === 'true') {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        let arr = [];
        try {
          const raw = await fs.readFile(MESSAGES_JSON, 'utf8');
          arr = JSON.parse(raw);
          if (!Array.isArray(arr)) arr = [];
        } catch { arr = []; }

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

    // ✅ Succès : redirection confirmation
    return res.redirect(303, '/confirmation?type=contact');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getContactPage,
  postContact,
};
