import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export const sendVerificationEmail = async ({
  to,
  token,
  expiresInMinutes,
}) => {
  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>

      <p>
        Thanks for creating an account.
      </p>

      <p>
        Click the link below to verify your email.
      </p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>
        This link expires in ${expiresInMinutes} minutes.
      </p>
    `,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  token,
  expiresInMinutes,
}) => {
  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        Click the link below to choose a new password.
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>
        This link expires in ${expiresInMinutes} minutes.
      </p>

      <p>
        If you did not request this,
        you can safely ignore this email.
      </p>
    `,
  });
};