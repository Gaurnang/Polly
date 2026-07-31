import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  setEmailVerified,
  updateUserPassword,
} from "../repository/auth.repository.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import {
  generateMagicToken,
  validateToken,
  buildMagicLink,
  markTokenUsed,
} from "./magicLink.service.js";
import { sendMagicLinkEmail } from "./email.service.js";

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, username, password }) => {
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) throw { status: 409, message: "Email is already registered." };

  const existingUsername = await findUserByUsername(username);
  if (existingUsername) throw { status: 409, message: "Username is already taken." };

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ email, username, password: hashedPassword });

  try {
    const { token, expiresInMinutes } = await generateMagicToken(user.id, "email_verification");
    const magicLink = buildMagicLink(token, "email_verification");
    await sendMagicLinkEmail({ to: email, purpose: "email_verification", magicLink, expiresInMinutes });
  } catch (emailErr) {
    // Log the error but don't fail registration — account exists, email_verified=false
    // so login is still blocked until verified
    console.error("Failed to send verification email:", emailErr?.message || emailErr);
  }

  return { message: "Registration successful. Please check your email to verify your account." };
};

export const verifyEmail = async (tokenValue) => {
  const record = await validateToken(tokenValue, "email_verification");
  await markTokenUsed(record.id);
  const user = await setEmailVerified(record.user_id);

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

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw { status: 401, message: "Invalid email or password." };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid email or password." };

  if (!user.email_verified) {
    throw { status: 403, message: "Please verify your email before logging in. Check your inbox for the verification link." };
  }

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
  if (!user) throw { status: 404, message: "User not found." };
  return user;
};

export const refreshAccessToken = (refreshToken) => {
  if (!refreshToken) throw { status: 401, message: "Refresh token missing." };
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return generateAccessToken({ id: decoded.id });
  } catch {
    throw { status: 403, message: "Invalid or expired refresh token." };
  }
};

export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) return { message: "If that email is registered, a reset link has been sent." };

  const { token, expiresInMinutes } = await generateMagicToken(user.id, "password_reset");
  const magicLink = buildMagicLink(token, "password_reset");
  await sendMagicLinkEmail({ to: email, purpose: "password_reset", magicLink, expiresInMinutes });

  return { message: "If that email is registered, a reset link has been sent." };
};

export const confirmPasswordReset = async (tokenValue, newPassword) => {
  if (!newPassword || newPassword.length < 8)
    throw { status: 400, message: "Password must be at least 8 characters." };

  const record = await validateToken(tokenValue, "password_reset");
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUserPassword(record.user_id, hashedPassword);
  await markTokenUsed(record.id);

  return { message: "Password reset successful. You can now log in with your new password." };
};
