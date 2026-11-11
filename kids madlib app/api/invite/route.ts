import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Required environment variables (set in .env.local):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// Works with any SMTP provider: Gmail, Outlook, SendGrid, Mailgun, etc.

export async function POST(request: NextRequest) {
  try {
    const { email, storyTitle, shareCode, shareUrl } = await request.json();

    // Validate inputs
    if (!email || !shareCode || !shareUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: email, shareCode, shareUrl' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Verify SMTP is configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return NextResponse.json(
        { error: 'Email sending is not configured on this server.' },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const fromAddress = SMTP_FROM ?? SMTP_USER;
    const title = storyTitle ?? 'a Mad Libs story';

    // Append the invitee's email to the join link so the form pre-fills for them
    const joinUrl = `${shareUrl}?email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"Mad Libs Stories" <${fromAddress}>`,
      to: email,
      subject: `You're invited to join "${title}"! 🎨`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#fff;border-radius:16px;padding:40px;border:3px solid #c4b5fd;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-size:64px;">🎨</div>
              <h1 style="color:#6d28d9;font-size:28px;margin:12px 0 4px;">Mad Libs Stories</h1>
              <p style="color:#6b7280;margin:0;font-size:14px;">Collaborative Story Builder</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="color:#111827;font-size:18px;line-height:1.6;margin:0 0 16px;">
                You've been invited to join <strong style="color:#6d28d9;">"${title}"</strong> —
                a collaborative Mad Libs story!
              </p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0;">
                Click the button below to add your part to the story. The more players,
                the more hilarious it gets! 🎉
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${joinUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);
                       color:#fff;text-decoration:none;font-weight:bold;font-size:18px;
                       padding:16px 36px;border-radius:10px;">
                🚀 Join the Story
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f3ff;border-radius:10px;padding:16px;text-align:center;">
              <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Or use the share code:</p>
              <p style="color:#6d28d9;font-size:32px;font-weight:bold;font-family:monospace;
                        letter-spacing:6px;margin:0;">${shareCode}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                Your email address (${email}) will be used to identify you in the story.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `You're invited to join "${title}"!\n\nJoin here: ${joinUrl}\n\nOr use share code: ${shareCode}\n\nYour email (${email}) will identify you in the story.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invite email:', error);
    return NextResponse.json(
      { error: 'Failed to send invite email. Please try again.' },
      { status: 500 }
    );
  }
}
