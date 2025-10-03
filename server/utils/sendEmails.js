// server/utils/sendEmail.js (CommonJS)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify((err, ok) => {
  console.log('[mail] transport', err ? `KO ${err.message}` : `OK ${ok}`);
});

module.exports = async ({ to, subject, text, html }) => {
  const fromName = process.env.EMAIL_FROM_NAME || 'La Hora';
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const info = await transporter.sendMail({ from: `"${fromName}" <${from}>`, to, subject, text, html });
  return info; // { messageId, ... }
};
