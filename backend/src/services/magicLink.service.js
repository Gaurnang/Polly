import crypto from "crypto";
import {
  createToken,
  findTokenByValue,
  markTokenUsed,
  invalidateActiveTokensForUser,
} from "../repository/magicLink.repository.js";

const EXPIRY_MINUTES = {
  email_verification: 15,
  password_reset: 30,
};

const LINK_PATHS = {
  email_verification: "/verify-email",
  password_reset: "/reset-password",
};

export const generateMagicToken = async (userId, purpose) => {
  // Invalidate any existing active tokens for same purpose
  await invalidateActiveTokensForUser(userId, purpose);

  const token = crypto.randomBytes(32).toString("base64url");
  const minutes = EXPIRY_MINUTES[purpose];
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  await createToken({ userId, token, purpose, expiresAt });
  return { token, expiresInMinutes: minutes };
};

export const validateToken = async (tokenValue, expectedPurpose) => {
  const record = await findTokenByValue(tokenValue);

  if (!record) {
    throw { status: 401, message: "Invalid or expired link" };
  }

  if (record.purpose !== expectedPurpose) {
    throw { status: 401, message: "Invalid or expired link" };
  }

  if (record.used_at) {
    throw { status: 401, message: "Invalid or expired link" };
  }

  if (new Date(record.expires_at) < new Date()) {
    throw { status: 401, message: "Invalid or expired link" };
  }

  return record;
};

export const buildMagicLink = (token, purpose) => {
  const base = process.env.CLIENT_URL || "http://localhost:5173";
  const path = LINK_PATHS[purpose];
  return `${base}${path}?token=${token}`;
};

export { markTokenUsed };
