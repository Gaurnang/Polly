import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, email, username, email_verified, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async ({ email, username, password }) => {
  const result = await pool.query(
    `INSERT INTO users (email, username, password, email_verified)
     VALUES ($1, $2, $3, FALSE)
     RETURNING id, email, username, email_verified, created_at`,
    [email, username, password]
  );
  return result.rows[0];
};

export const setEmailVerified = async (userId) => {
  const result = await pool.query(
    `UPDATE users SET email_verified = TRUE WHERE id = $1
     RETURNING id, email, username, email_verified, created_at`,
    [userId]
  );
  return result.rows[0];
};

export const updateUserPassword = async (userId, hashedPassword) => {
  await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
};
