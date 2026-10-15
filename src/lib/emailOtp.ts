import { createHmac } from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'framlu-weddings-otp-secret-key-2026';

/**
 * Generate a cryptographically signed HMAC token for the given email, OTP, and expiry.
 * Valid for 10 minutes by default.
 */
export function generateOtpToken(email: string, otp: string, expiresInMinutes = 10): string {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const data = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`;
  const signature = createHmac('sha256', OTP_SECRET).update(data).digest('hex');
  return `${expiresAt}.${signature}`;
}

/**
 * Verify HMAC token against provided email and OTP.
 */
export function verifyOtpToken(
  email: string,
  otp: string,
  token: string
): { valid: boolean; reason?: string } {
  if (!token || !token.includes('.')) {
    return { valid: false, reason: 'Invalid or missing OTP token' };
  }

  const [expiresAtStr, signature] = token.split('.');
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: 'OTP expired. Please request a new code.' };
  }

  const expectedData = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`;
  const expectedSignature = createHmac('sha256', OTP_SECRET).update(expectedData).digest('hex');

  if (signature !== expectedSignature) {
    return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
  }

  return { valid: true };
}

/**
 * Send OTP Email via Resend, Brevo, or console log in development mode.
 */
export async function sendOtpEmail({
  to,
  name,
  otp,
}: {
  to: string;
  name: string;
  otp: string;
}): Promise<{ sent: boolean; provider: string; devOtp?: string }> {
  const cleanEmail = to.toLowerCase().trim();
  const userName = name?.trim() || 'Customer';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Framlu Weddings OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbf7f4; margin: 0; padding: 24px; color: #292524; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #fed7aa; padding: 36px 28px; box-shadow: 0 10px 25px -5px rgba(180, 83, 9, 0.08); }
        .logo-badge { display: inline-block; background: #fef3c7; color: #b45309; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }
        .title { font-size: 22px; font-weight: 800; color: #1c1917; margin: 0 0 8px 0; }
        .subtitle { font-size: 14px; color: #78716c; line-height: 1.5; margin: 0 0 24px 0; }
        .otp-container { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .otp-digits { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #78350f; font-family: 'Courier New', Courier, monospace; margin: 0; padding-left: 10px; }
        .notice { font-size: 12px; color: #a8a29e; line-height: 1.6; text-align: center; margin: 20px 0 0 0; }
        .divider { height: 1px; background: #f5f5f4; margin: 28px 0 20px 0; }
        .footer { text-align: center; font-size: 11px; color: #a8a29e; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center;">
          <div class="logo-badge">Framlu Wedding Company</div>
          <h1 class="title">ഇമെയിൽ സ്ഥിരീകരണ കോഡ്</h1>
          <p class="subtitle">
            പ്രിയപ്പെട്ട <strong>${userName}</strong>, നിങ്ങളുടെ ആപ്പ് ലോഗിൻ സ്ഥിരീകരണത്തിനായുള്ള OTP കോഡ് താഴെ നൽകുന്നു:
          </p>
        </div>

        <div class="otp-container">
          <div class="otp-label">Verification OTP Code</div>
          <div class="otp-digits">${otp}</div>
        </div>

        <p class="notice">
          ⏱️ ഈ കോഡ് അടുത്ത <strong>10 മിനിറ്റ്</strong> വരെ മാത്രമേ സാധുവാകൂ.<br>
          സുരക്ഷയ്ക്കായി ഈ കോഡ് മറ്റാരുമായും പങ്കുവെക്കരുത്.
        </p>

        <div class="divider"></div>

        <div class="footer">
          <strong>Framlu Wedding Company</strong><br>
          Kayamkulam, Alappuzha, Kerala<br>
          Phone: +91 97473 09540
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Try Resend API (if configured in .env.local)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Framlu Weddings <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: `${otp} is your Framlu Weddings verification code`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'resend' };
      }
      const err = await res.json().catch(() => ({}));
      console.error('Resend error:', err);
    } catch (e: any) {
      console.error('Resend fetch failed:', e);
    }
  }

  // 2. Try Brevo API (if configured in .env.local)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: 'Framlu Weddings',
            email: process.env.EMAIL_FROM || 'noreply@framluweddings.com',
          },
          to: [{ email: cleanEmail, name: userName }],
          subject: `${otp} is your Framlu Weddings verification code`,
          htmlContent: htmlContent,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'brevo' };
      }
      const err = await res.json().catch(() => ({}));
      console.error('Brevo error:', err);
    } catch (e: any) {
      console.error('Brevo fetch failed:', e);
    }
  }

  // 3. Fallback: Log in console for Development / Testing
  console.log(`\n======================================================`);
  console.log(`📨 [Framlu Weddings] Email OTP for: ${cleanEmail}`);
  console.log(`🔑 Verification Code: ${otp}`);
  console.log(`======================================================\n`);

  return {
    sent: false,
    provider: 'console',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  };
}
