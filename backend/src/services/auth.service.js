import bcrypt from "bcrypt";

import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateUserPassword,
} from "../repository/auth.repository.js";

import {
  generateMagicToken,
  validateToken,
} from "./magicLink.service.js";
import { markTokenUsed } from "../repository/magicLink.repository.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from "./email.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export const registerUser = async ({
  email,
  username,
  password,
}) => {
  // 1. Check if email already exists
  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw {
      status: 409,
      message: "Email is already registered.",
    };
  }

  // 2. Check if username already exists
  const existingUsername = await findUserByUsername(username);

  if (existingUsername) {
    throw {
      status: 409,
      message: "Username is already taken.",
    };
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    SALT_ROUNDS
  );

  // 4. Create user
  const user = await createUser({
    email,
    username,
    password: hashedPassword,
  });

  // 5. Generate email verification token
  const {
    token,
    expiresInMinutes,
  } = await generateMagicToken(
    user.id,
    "email_verification"
  );

  // 6. Send verification email
  await sendVerificationEmail({
    to: user.email,
    token,
    expiresInMinutes,
  });

  // 7. Return registration result
  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

export const resendVerificationEmail = async (email) => {
  // 1. Find the user
  const user = await findUserByEmail(email);

  // Don't reveal whether the email exists
  if (!user) {
    return {
      message:
        "If that email is registered, a verification email has been sent.",
    };
  }

  // 2. Already verified? Nothing to resend
  if (user.email_verified) {
    return {
      message: "Email is already verified.",
    };
  }

  // 3. Invalidate old active verification tokens
  const {
    token,
    expiresInMinutes,
  } = await generateMagicToken(
    user.id,
    "email_verification"
  );

  // 4. Send new verification email
  await sendVerificationEmail({
    to: user.email,
    token,
    expiresInMinutes,
  });

  return {
    message:
      "If that email is registered, a verification email has been sent.",
  };
};

export const loginUser = async ({ email, password }) => {
  // 1. Find user by email
  const user = await findUserByEmail(email);

  // 2. User doesn't exist
  if (!user) {
    throw {
      status: 401,
      message: "Invalid email or password.",
    };
  }

  // 3. Compare entered password with stored bcrypt hash
  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw {
      status: 401,
      message: "Invalid email or password.",
    };
  }

  // 4. Check email verification
  if (!user.email_verified) {
    throw {
      status: 403,
      message:
        "Please verify your email before logging in.",
    };
  }

  // 5. Don't return the password
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };

  return {
    user: safeUser,
    accessToken: generateAccessToken(safeUser),
    refreshToken: generateRefreshToken(safeUser),
  };
};

export const getMe = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw {
      status: 404,
      message: "User not found.",
    };
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };
};

export const refreshAccessToken = (refreshToken) => {
  if (!refreshToken) {
    throw {
      status: 401,
      message: "Refresh token missing.",
    };
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Create a new access token
    const accessToken = generateAccessToken({
      id: decoded.id,
    });

    return accessToken;
  } catch (err) {
    throw {
      status: 403,
      message: "Invalid or expired refresh token.",
    };
  }
};

export const requestPasswordReset = async (
  email
) => {
  const user = await findUserByEmail(email);

  // Don't reveal whether the email exists
  if (!user) {
    return {
      message:
        "If that email is registered, a reset link has been sent.",
    };
  }

  const {
    token,
    expiresInMinutes,
  } = await generateMagicToken(
    user.id,
    "password_reset"
  );

  await sendPasswordResetEmail({
    to: user.email,
    token,
    expiresInMinutes,
  });

  return {
    message:
      "If that email is registered, a reset link has been sent.",
  };
};

export const confirmPasswordReset = async (
  tokenValue,
  newPassword
) => {
  // 1. Validate password
  if (
    !newPassword ||
    newPassword.length < 6
  ) {
    throw {
      status: 400,
      message:
        "Password must be at least 6 characters.",
    };
  }

  // 2. Validate password-reset token
  const record = await validateToken(
    tokenValue,
    "password_reset"
  );

  // 3. Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    SALT_ROUNDS
  );

  // 4. Update password
  const user = await updateUserPassword(
    record.user_id,
    hashedPassword
  );

  if (!user) {
    throw {
      status: 404,
      message: "User not found.",
    };
  }

  // 5. Token can never be used again
  await markTokenUsed(record.id);

  return {
    message:
      "Password reset successful. You can now log in with your new password.",
  };
};