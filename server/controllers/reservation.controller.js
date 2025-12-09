// 📁 server/controllers/pages/reservation.controller.js

// ===============================
// Chargement du modèle
// ===============================
let Reservation = null;
try {
  Reservation = require('../models/reservation.model');
} catch (e) {
  console.error("⚠ Impossible de charger Reservation model :", e.message);
}

// ===============================
// SERVICE MAIL CENTRALISÉ
// ===============================
function mailer(req) {
  return req.app.locals.mailerService;
}

// ===============================
// GET /reservation
// ===============================
function getReservationPage(req, res, next) {
  try {
    return res.status(200).render('pages/reservation', { title: 'Réservation — La Hora' });
  } catch (err) {
    return next(err);
  }
}

// ===============================
// Helpers
// ===============================
const trimOrEmpty = (v) => (typeof v === 'string' ? v.trim() : '');
const isValidEmail = (e) => /^\S+@\S+\.\S+$/.test(e);

function makeLocalDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const OPENING_HOURS = {
  0: [],
  1: [['10:00','14:30'], ['18:00','23:30']],
  2: [['10:00','14:30'], ['18:00','23:30']],
  3: [['10:00','14:30'], ['18:00','23:30']],
  4: [['10:00','14:30'], ['18:00','23:30']],
  5: [['10:00','14:30'], ['18:00','00:30']],
  6: [['10:00','14:30'], ['18:00','00:30']],
};

function toMin(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

function inRanges(hhmm, ranges) {
  const t = toMin(hhmm);
  return (ranges || []).some(([a, b]) => {
    const s = toMin(a), e = toMin(b);
    if (e >= s) return t >= s && t <= e;
    return t >= s || t <= e;
  });
}

function isQuarterStep(hhmm) {
  const mins = Number(String(hhmm).split(':')[1] || 0);
  return mins % 15 === 0;
}

// ===============================
// POST /reservation
// ===============================
async function postReservation(req, res, next) {
  console.log("DEBUG Reservation =>", Reservation);

  try {
    const {
      date, time, people,
      firstname, lastname, phone, email,
      message,
    } = req.body || {};

    // Normalisation
    const _date = trimOrEmpty(date);
    const _time = trimOrEmpty(time);
    const _people = Number.parseInt(people, 10);
    const _firstname = trimOrEmpty(firstname);
    const _lastname  = trimOrEmpty(lastname);
    const _phone     = trimOrEmpty(phone);
    const _email     = trimOrEmpty(email);
    const _message   = trimOrEmpty(message);

    const dt = makeLocalDateTime(_date, _time);

    // Vérifications
    if (
      !_date || !_time || !dt ||
      !Number.isInteger(_people) || _people < 1 ||
      !_firstname || !_lastname || !_phone ||
      !_email || !isValidEmail(_email)
    ) {
      return res.status(400).render('pages/reservation', {
        title: 'Réservation — La Hora',
        error: 'Merci de compléter tous les champs requis correctement.',
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    // Date passée
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    if (new Date(`${_date}T00:00:00`) < new Date(`${todayIso}T00:00:00`)) {
      return res.status(400).render('pages/reservation', {
        error: "La date choisie est déjà passée.",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    // Heure passée
    if (_date === todayIso) {
      if (toMin(_time) < toMin(`${now.getHours()}:${now.getMinutes()}`)) {
        return res.status(400).render('pages/reservation', {
          error: "L'heure choisie est déjà passée aujourd’hui.",
          form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
        });
      }
    }

    // Horaires
    const day = new Date(`${_date}T00:00:00`).getDay();
    const todaysRanges = OPENING_HOURS[day] || [];

    if (todaysRanges.length === 0 || !inRanges(_time, todaysRanges)) {
      return res.status(400).render('pages/reservation', {
        error: "L’heure choisie n’est pas dans les horaires d’ouverture.",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    if (!isQuarterStep(_time)) {
      return res.status(400).render('pages/reservation', {
        error: "Les réservations se font par créneaux de 15 minutes.",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    // ===============================
    // 🔐 Sauvegarde MongoDB
    // ===============================
    let saved = null;

    if (Reservation && typeof Reservation.create === 'function') {
      saved = await Reservation.create({
        date: _date,
        time: _time,
        people: _people,
        firstname: _firstname,
        lastname: _lastname,
        phone: _phone,
        email: _email,
        message: _message || '',
        createdAt: new Date(),
      });

      // ===============================
      // 🔌 ENVOI DES EMAILS (PREMIUM + LIGHT)
      // ===============================
      try {
        await mailer(req).sendReservationReceiptClient(_email, saved);
        await mailer(req).notifyAdminReservation(saved);
      } catch (mailErr) {
        console.error("[mail] erreur:", mailErr);
      }
    }

    // Redirection
    if (saved && saved._id) {
      return res.redirect(`/reservation/confirmation?id=${saved._id.toString()}`);
    }

    return res.redirect('/confirmation');

  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getReservationPage,
  postReservation,
};
