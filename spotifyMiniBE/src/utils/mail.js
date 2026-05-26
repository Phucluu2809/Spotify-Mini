const nodemailer = require('nodemailer');

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getTransporter = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing SMTP config: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendPasswordResetOtpEmail = async ({ to, name, otp, expiresInMinutes }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const displayName = name || 'there';
  const safeDisplayName = escapeHtml(displayName);
  const safeOtp = escapeHtml(otp);

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Spotify Mini password reset OTP',
    text: [
      `Hi ${displayName},`,
      '',
      'We received a request to reset your Spotify Mini password.',
      `Use this OTP within ${expiresInMinutes} minutes to create a new password:`,
      otp,
      '',
      'If you did not request this, you can ignore this email.'
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Your Spotify Mini password reset OTP</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>We received a request to reset your Spotify Mini password.</p>
        <p>Enter this OTP in the app to create a new password:</p>
        <p style="font-size:32px;letter-spacing:8px;background:#f4f4f4;border-radius:8px;padding:16px 18px;font-family:Consolas,monospace;font-weight:700">${safeOtp}</p>
        <p>This OTP expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
};

module.exports = { sendPasswordResetOtpEmail };
