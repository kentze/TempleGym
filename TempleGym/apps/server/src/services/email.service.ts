import { config } from '../config';

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.SMTP_FROM,
      to,
      subject: 'Your TempleGym login code',
      html: `
        <div style="font-family:sans-serif;max-width:400px;">
          <h2>TempleGym</h2>
          <p>Your one-time login code:</p>
          <h1 style="letter-spacing:8px;color:#9D2235;">${code}</h1>
          <p style="color:#888;">Expires in ${config.OTP_EXPIRY_MINUTES} minutes.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend API error ${res.status}: ${body}`);
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
