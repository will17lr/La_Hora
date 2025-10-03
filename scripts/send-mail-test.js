require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.verify();
    console.log('✅ SMTP prêt');

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'La Hora'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: 'Test La Hora',
      text: 'Message de test',
      html: '<b>Message de test</b>',
    });
    console.log('✉️  Envoyé:', info.messageId);
    process.exit(0);
  } catch (e) {
    console.error('❌ Envoi KO:', e.code || '', e.message);
    if (e.response) console.error(String(e.response));
    process.exit(1);
  }
})();
