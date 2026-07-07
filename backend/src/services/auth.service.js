import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
} from "../repository/auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, username, password }) => {
  // Check for duplicates
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    throw { status: 409, message: "Email is already registered." };
  }

  const existingUsername = await findUserByUsername(username);
  if (existingUsername) {
    throw { status: 409, message: "Username is already taken." };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUser({ email, username, password: hashedPassword });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  };

  const accessToken  = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  return { user: safeUser, accessToken, refreshToken };
};

export const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }
  return user;
};

export const refreshAccessToken = (refreshToken) => {
  if (!refreshToken) {
    throw { status: 401, message: "Refresh token missing." };
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const newAccessToken = generateAccessToken({ id: decoded.id });
    return newAccessToken;
  } catch {
    throw { status: 403, message: "Invalid or expired refresh token." };
  }
};
