import bcrypt from "bcrypt";
import {
  findUserProfileById,
  updateUserRecord,
  updateUserPassword,
  findRawUserById,
} from "../repository/user.repository.js";

const SALT_ROUNDS = 12;

export const getUserProfile = async (id) => {
  const user = await findUserProfileById(id);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }
  return user;
};

export const updateUserProfile = async (id, { username, email }) => {
  if (!username && !email) {
    throw { status: 400, message: "Provide at least one field to update (username or email)." };
  }

  const updated = await updateUserRecord(id, { username, email });
  if (!updated) {
    throw { status: 404, message: "User not found." };
  }
  return updated;
};

export const changePassword = async (id, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw { status: 400, message: "currentPassword and newPassword are required." };
  }

  const user = await findRawUserById(id);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Current password is incorrect." };
  }

  if (newPassword.length < 6) {
    throw { status: 400, message: "New password must be at least 6 characters." };
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUserPassword(id, hashed);

  return { message: "Password changed successfully." };
};
