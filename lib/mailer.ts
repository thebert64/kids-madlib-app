import nodemailer, { type Transporter } from 'nodemailer';

// Configured through SMTP_* env vars; see README "Email invites".
let transporter: Transporter | null = null;

export function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

const EMAIL_PATTERN = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface InviteEmail {
  to: string;
  storyTitle: string;
  inviterName?: string;
  joinUrl: string;
}

export async function sendInviteEmail({ to, storyTitle, inviterName, joinUrl }: InviteEmail) {
  const who = inviterName || 'A friend';
  const subject = `${who} invited you to write a Mad Libs story!`;
  const text = [
    `${who} wants you to help write "${storyTitle}".`,
    '',
    `Join the story here: ${joinUrl}`,
    '',
    'Have fun!',
  ].join('\n');
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="color: #581c87;">🎨 You're invited!</h1>
      <p style="font-size: 16px;">${escapeHtml(who)} wants you to help write
        <strong>"${escapeHtml(storyTitle)}"</strong>.</p>
      <p><a href="${escapeHtml(joinUrl)}"
        style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 20px;
        border-radius: 8px; font-weight: bold; text-decoration: none;">🎉 Join the Story</a></p>
      <p style="color: #6b7280; font-size: 13px;">Or open this link: ${escapeHtml(joinUrl)}</p>
    </div>`;

  await getTransporter().sendMail({ from: process.env.MAIL_FROM, to, subject, text, html });
}
