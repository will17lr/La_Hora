// server/controllers/reservation.controller.js
// Skeleton controller — reservation page + create

let Reservation = null;
try {
  Reservation = require('../models/reservation.model.js');
} catch {
  // Laisse null : fallback JSON possible si pas de Mongo
}

// const { saveJson } = require('../utils/fileUtils'); // fallback JSON optionnel

// GET /reservation
function getReservationPage(req, res, next) {
  try {
    return res.status(200).render('pages/reservation', { title: 'Réservation — La Hora' });
  } catch (err) {
    return next(err);
  }
}

// Helpers
const trimOrEmpty = (v) => (typeof v === 'string' ? v.trim() : '');
const isValidEmail = (e) => /^\S+@\S+\.\S+$/.test(e);

function makeLocalDateTime(dateStr, timeStr) {
  // Attend "YYYY-MM-DD" + "HH:mm"
  if (!dateStr || !timeStr) return null;
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// === Horaires d'ouverture (0=Dim ... 6=Sam) — adapte si besoin ===
const OPENING_HOURS = {
  0: [], // Dimanche fermé
  1: [['10:00','14:30'], ['18:00','23:30']], // Lundi
  2: [['10:00','14:30'], ['18:00','23:30']], // Mardi
  3: [['10:00','14:30'], ['18:00','23:30']], // Mercredi
  4: [['10:00','14:30'], ['18:00','23:30']], // Jeudi
  5: [['10:00','14:30'], ['18:00','00:30']], // Vendredi (passe minuit)
  6: [['10:00','14:30'], ['18:00','00:30']], // Samedi (passe minuit)
};

function toMin(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

// heure ∈ [start,end] en gérant le passage minuit pour end < start
function inRanges(hhmm, ranges) {
  const t = toMin(hhmm);
  return (ranges || []).some(([a, b]) => {
    const s = toMin(a), e = toMin(b);
    if (e >= s) return t >= s && t <= e;   // plage normale
    return t >= s || t <= e;               // plage qui passe minuit
  });
}

// impose des créneaux de 15 minutes (00, 15, 30, 45)
function isQuarterStep(hhmm) {
  const mins = Number(String(hhmm).split(':')[1] || 0);
  return mins % 15 === 0;
}

// POST /reservation
async function postReservation(req, res, next) {
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

    // 1) Champs de base (avant les règles d'horaires pour des messages logiques)
    if (
      !_date || !_time || !dt ||
      !Number.isInteger(_people) || _people < 1 ||
      !_firstname || !_lastname || !_phone ||
      !_email || !isValidEmail(_email)
    ) {
      return res.status(400).render('pages/reservation', {
        title: 'Réservation — La Hora',
        error: 'Merci de compléter correctement tous les champs requis (date/heure valides, email valide, nombre de personnes ≥ 1).',
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    // 2) Interdire date passée + heure passée si aujourd'hui
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10); // YYYY-MM-DD
    // journée passée
    if (new Date(`${_date}T00:00:00`) < new Date(`${todayIso}T00:00:00`)) {
      return res.status(400).render('pages/reservation', {
        title: 'Réservation — La Hora',
        error: "La date choisie est déjà passée.",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }
    // heure passée (si aujourd'hui)
    if (_date === todayIso) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (toMin(_time) < nowMin) {
        return res.status(400).render('pages/reservation', {
          title: 'Réservation — La Hora',
          error: "L'heure choisie est déjà passée pour aujourd'hui.",
          form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
        });
      }
    }

    // 3) Horaires d'ouverture + pas de 15 min
    const day = new Date(`${_date}T00:00:00`).getDay();
    const todaysRanges = OPENING_HOURS[day] || [];

    if (todaysRanges.length === 0 || !inRanges(_time, todaysRanges)) {
      return res.status(400).render('pages/reservation', {
        title: 'Réservation — La Hora',
        error: "L’heure choisie n’est pas dans les horaires d’ouverture.",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    if (!isQuarterStep(_time)) {
      return res.status(400).render('pages/reservation', {
        title: 'Réservation — La Hora',
        error: "Les réservations se font par créneaux de 15 minutes (00, 15, 30, 45).",
        form: { date: _date, time: _time, people: _people, firstname: _firstname, lastname: _lastname, phone: _phone, email: _email, message: _message },
      });
    }

    // 4) Persistance : priorité Mongo si le modèle est dispo
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
    } else {
      // Fallback JSON (désactive si tu n’en veux pas)
      // await saveJson(path.join(__dirname, '../../data/reservations.json'), { ... })
    }

    // 5) Redirection (avec id si dispo)
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
