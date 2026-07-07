import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, email, username, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async ({ email, username, password }) => {
  const result = await pool.query(
    `INSERT INTO users (email, username, password)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, created_at`,
    [email, username, password]
  );
  return result.rows[0];
};
