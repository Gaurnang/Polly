const SUBJECTS = {
  email_verification: "Verify your Polly email",
  password_reset: "Reset your Polly password",
};

const HEADINGS = {
  email_verification: "Verify your email",
  password_reset: "Reset your password",
};

const BUTTON_LABELS = {
  email_verification: "Verify Email",
  password_reset: "Reset Password",
};

const DESCRIPTIONS = {
  email_verification: "Thanks for signing up! Click the button below to verify your email address and get started.",
  password_reset: "We received a request to reset your password. Click the button below to set a new password.",
};

export const renderEmail = ({ purpose, magicLink, expiresInMinutes }) => {
  if (!purpose || !magicLink || !expiresInMinutes) {
    throw new Error("renderEmail: purpose, magicLink, and expiresInMinutes are required");
  }

  const subject = SUBJECTS[purpose];
  const heading = HEADINGS[purpose];
  const buttonLabel = BUTTON_LABELS[purpose];
  const description = DESCRIPTIONS[purpose];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" style="max-width:480px;" cellspacing="0" cellpadding="0" border="0">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#7c3aed;border-radius:12px;padding:10px 14px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">⚡ Polly</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#161625;border-radius:20px;border:1px solid rgba(255,255,255,0.08);padding:40px 36px;">
              <h1 style="margin:0 0 12px;color:#f1f5f9;font-size:24px;font-weight:700;line-height:1.3;">${heading}</h1>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">${description}</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${magicLink}"
                       style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:0.1px;">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Expiry notice -->
              <p style="margin:0 0 20px;color:#64748b;font-size:13px;text-align:center;">
                This link expires in <strong style="color:#94a3b8;">${expiresInMinutes} minutes</strong>.
              </p>
              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;" />
              <!-- Fallback link -->
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${magicLink}" style="color:#7c3aed;word-break:break-all;">${magicLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#475569;font-size:12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${heading}\n\n${description}\n\n${buttonLabel}: ${magicLink}\n\nThis link expires in ${expiresInMinutes} minutes.\n\nIf the button doesn't work, copy and paste this link into your browser:\n${magicLink}\n\nIf you didn't request this, you can safely ignore this email.`;

  return { subject, html, text };
};
