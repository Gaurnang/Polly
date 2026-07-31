import { Resend } from "resend";
import { renderEmail } from "../templates/magicLinkEmail.js";

if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
  console.warn("WARNING: RESEND_API_KEY is not configured. Emails will not be sent.");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@polly.app";

export const sendMagicLinkEmail = async ({ to, purpose, magicLink, expiresInMinutes }) => {
  const { subject, html, text } = renderEmail({ purpose, magicLink, expiresInMinutes });

  console.log(`[email] Sending "${subject}" to ${to} from ${FROM_EMAIL}`);
  console.log(`[email] Magic link: ${magicLink}`);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email] Resend error:", JSON.stringify(error));
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }

  console.log(`[email] Sent successfully, id: ${data?.id}`);
};
