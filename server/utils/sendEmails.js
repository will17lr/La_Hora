// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify((err, success) => {
  if (err) {
    console.log('[mail] transport KO:', err.message);
   } else {
    console.log('[mail] transport OK');
   }
});

module.exports = async ({ to, subject, text, html }) => {
  const fromName = process.env.EMAIL_FROM_NAME || 'La Hora';
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  return transporter.sendMail;({
    from: `"${fromName}" <${from}>`,
    to,
    subject,
    text,
    html,
  });
};