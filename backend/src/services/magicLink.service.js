import crypto from "crypto";

import {
  createToken,
  findTokenByValue,
  markTokenUsed,
  invalidateActiveTokensForUser,
} from "../repository/magicLink.repository.js";

import { setEmailVerified } from "../repository/auth.repository.js";

const TOKEN_EXPIRES_IN_MINUTES = 15;

// ------------------------------------
// Generate a new magic token
// ------------------------------------
export const generateMagicToken = async (
  userId,
  purpose
) => {
  // Invalidate previous active tokens
  await invalidateActiveTokensForUser(
    userId,
    purpose
  );

  // Generate random token
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  // Token expires after 15 minutes
  const expiresAt = new Date(
    Date.now() +
      TOKEN_EXPIRES_IN_MINUTES * 60 * 1000
  );

  // Save token in database
  await createToken({
    userId,
    token,
    purpose,
    expiresAt,
  });

  return {
    token,
    expiresInMinutes:
      TOKEN_EXPIRES_IN_MINUTES,
  };
};

// ------------------------------------
// Validate a magic token
// ------------------------------------
export const validateToken = async (
  token,
  expectedPurpose
) => {
  // Find token in database
  const record = await findTokenByValue(token);

  // Token doesn't exist
  if (!record) {
    throw {
      status: 400,
      message: "Invalid or expired token.",
    };
  }

  // Check purpose
  if (record.purpose !== expectedPurpose) {
    throw {
      status: 400,
      message: "Invalid token.",
    };
  }

  // Check if already used
  if (record.used_at) {
    throw {
      status: 400,
      message: "Token has already been used.",
    };
  }

  // Check expiration
  if (new Date(record.expires_at) < new Date()) {
    throw {
      status: 400,
      message: "Token has expired.",
    };
  }

  return record;
};

// ------------------------------------
// Verify email
// ------------------------------------
export const verifyEmail = async (
  tokenValue
) => {
  // 1. Validate token
  const record = await validateToken(
    tokenValue,
    "email_verification"
  );

  // 2. Mark token as used
  await markTokenUsed(record.id);

  // 3. Verify user's email
  const user = await setEmailVerified(
    record.user_id
  );

  if (!user) {
    throw {
      status: 404,
      message: "User not found.",
    };
  }

  return user;
};

