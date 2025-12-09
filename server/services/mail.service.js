// server/services/mail.service.js
const nodemailer = require("nodemailer");

let transporter = null;

/* -----------------------------------------------------------
   INITIALISATION SMTP
----------------------------------------------------------- */
function initMailer() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((err) => {
    if (err) console.error("[mail] Transport error:", err);
    else console.log("[mail] Transport OK");
  });

  return transporter;
}

/* -----------------------------------------------------------
   TEMPLATE EMAIL RESPONSIVE & CENTRÉ
----------------------------------------------------------- */
function baseEmailTemplate(title, contentHTML) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      body { margin:0; padding:20px; background:#cbaf7a; font-family:Arial, sans-serif; }
      img { max-width:100%; height:auto; display:block; }

      .container {
        width:100% !important;
        max-width:600px !important;
        margin:0 auto !important;   /* ◀ CENTRAGE FORCÉ */
      }

      .inner { padding:30px; }

      .btn {
        display:inline-block;
        background:#cbaf7a;
        color:#000;
        padding:12px 24px;
        font-size:16px;
        font-weight:bold;
        border-radius:6px;
        text-decoration:none;
      }

      /* MOBILE */
      @media screen and (max-width: 600px) {
        .inner { padding:20px !important; }
        .btn {
          width:100% !important;
          display:block !important;
          text-align:center !important;
          padding:14px 20px !important;
        }
        h1 { font-size:22px !important; }
        p, a, td, span { font-size:15px !important; }
      }
    </style>
  </head>

  <body>

    <!-- TABLE FULL WIDTH -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="width:100%; margin:0; padding:0;">
      <tr>
        <td align="center">

          <!-- CONTENEUR 600px -->
          <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0"
                 style="background:#111; border-radius:10px; border:1px solid #2a2a2a; overflow:hidden;">

            <!-- HEADER -->
            <tr>
              <td style="background:#000; padding:25px; text-align:center; border-bottom:1px solid #444;">
                <h1 style="color:#cbaf7a; font-size:26px; margin:0; font-weight:700;">${title}</h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td class="inner" style="line-height:1.6;">
                ${contentHTML}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#000; padding:15px; text-align:center; color:#777; font-size:12px;">
                La Hora — La Rochelle<br>
                © ${new Date().getFullYear()}
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

/* -----------------------------------------------------------
   1) EMAIL CLIENT — Accusé de réception
----------------------------------------------------------- */
async function sendReservationReceiptClient(to, reservation) {
  const transporter = initMailer();

  const html = baseEmailTemplate(
    "La Hora — Réservation reçue",
    `
    <p style="font-size:17px;">
      Bonjour <strong style="color:#cbaf7a;">${reservation.firstname}</strong>,
    </p>

    <p>
      Merci pour votre demande de réservation au bar 
      <strong style="color:#cbaf7a;">La Hora</strong>.
      Voici votre récapitulatif :
    </p>

    <div style="background:#1a1a1a; border:1px solid #333;
                border-radius:8px; padding:20px; margin-top:20px;">
      <h3 style="color:#cbaf7a; margin-top:0;">Détails</h3>

      <p><strong>Date :</strong> ${reservation.date}</p>
      <p><strong>Heure :</strong> ${reservation.time}</p>
      <p><strong>Personnes :</strong> ${reservation.people}</p>
      <p><strong>Nom :</strong> ${reservation.lastname} ${reservation.firstname}</p>
      <p><strong>Téléphone :</strong> ${reservation.phone}</p>
      <p><strong>Email :</strong> ${reservation.email}</p>

      ${
        reservation.message
          ? `
            <p style="margin-top:15px;">
              <strong>Message :</strong><br>
              <span style="display:block; margin-top:5px; padding:10px;
                           background:#111; border:1px solid #333;
                           border-radius:6px; color:#ccc;">
                ${reservation.message}
              </span>
            </p>
          `
          : ""
      }
    </div>

    <p style="margin-top:25px;color:#ccc;font-size:14px;">
      Nous vous recontacterons pour confirmer la réservation.
    </p>

    <p style="margin-top:25px;">À très bientôt ✨</p>
    `
  );

  await transporter.sendMail({
    from: `"La Hora" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Votre demande de réservation – La Hora",
    html,
  });
}

/* -----------------------------------------------------------
   2) EMAIL CONFIRMATION ADMIN → CLIENT
----------------------------------------------------------- */
async function sendReservationConfirmationAdmin(to, reservation) {
  const transporter = initMailer();

  const html = baseEmailTemplate(
    "La Hora — Réservation confirmée",
    `
    <p style="font-size:17px;">
      Bonjour <strong style="color:#cbaf7a;">${reservation.firstname}</strong>,
    </p>

    <p>
      Votre réservation à <strong style="color:#cbaf7a;">La Hora</strong> est confirmée.
    </p>

    <div style="background:#1a1a1a; border:1px solid #333;
                border-radius:8px; padding:20px; margin-top:20px;">
      <h3 style="color:#cbaf7a;margin-top:0;">Détails confirmés</h3>

      <p><strong>Date :</strong> ${reservation.date}</p>
      <p><strong>Heure :</strong> ${reservation.time}</p>
      <p><strong>Personnes :</strong> ${reservation.people}</p>
      <p><strong>Email :</strong> ${reservation.email}</p>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="https://lahora.fr" class="btn">Visiter le site La Hora</a>
    </div>

    <p style="margin-top:25px;">À très bientôt ✨</p>
    `
  );

  await transporter.sendMail({
    from: `"La Hora" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Confirmation de votre réservation – La Hora",
    html,
  });
}

/* -----------------------------------------------------------
   3) NOTIFICATION ADMIN — Réservation
----------------------------------------------------------- */
async function notifyAdminReservation(res) {
  const transporter = initMailer();

  const text = `
Nouvelle réservation reçue :

Nom : ${res.lastname} ${res.firstname}
Téléphone : ${res.phone}
Email : ${res.email}

Date : ${res.date}
Heure : ${res.time}
Personnes : ${res.people}

Message :
${res.message || "(aucun)"}
`;

  await transporter.sendMail({
    from: `"La Hora" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: "Nouvelle réservation reçue – La Hora",
    text,
  });
}

/* -----------------------------------------------------------
   4) NOTIFICATION ADMIN — Contact
----------------------------------------------------------- */
async function notifyAdminContact(data) {
  const transporter = initMailer();

  const text = `
Nouveau message de contact :

Nom : ${data.firstname} ${data.lastname}
Email : ${data.email}
Téléphone : ${data.phone || "(non fourni)"}

Message :
${data.message}
`;

  await transporter.sendMail({
    from: `"La Hora" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: "Nouveau message de contact – La Hora",
    text,
  });
}

/* -----------------------------------------------------------
   EXPORTS
----------------------------------------------------------- */
module.exports = {
  initMailer,
  sendReservationReceiptClient,
  sendReservationConfirmationAdmin,
  notifyAdminReservation,
  notifyAdminContact,
};
