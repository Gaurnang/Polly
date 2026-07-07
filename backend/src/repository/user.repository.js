import pool from "../config/db.js";

// Get user profile (no password)
export const findUserProfileById = async (id) => {
  const result = await pool.query(
    `SELECT
       u.id,
       u.email,
       u.username,
       u.created_at,
       COUNT(DISTINCT p.id)  AS polls_created,
       COUNT(DISTINCT pr.id) AS polls_participated
     FROM users u
     LEFT JOIN polls p        ON p.creator_id = u.id
     LEFT JOIN poll_responses pr ON pr.user_id = u.id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  );
  return result.rows[0] || null;
};

// Update username and/or email
export const updateUserRecord = async (id, { username, email }) => {
  const result = await pool.query(
    `UPDATE users
     SET
       username = COALESCE($2, username),
       email    = COALESCE($3, email)
     WHERE id = $1
     RETURNING id, email, username, created_at`,
    [id, username, email]
  );
  return result.rows[0] || null;
};

// Update password
export const updateUserPassword = async (id, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users SET password = $2 WHERE id = $1 RETURNING id`,
    [id, hashedPassword]
  );
  return result.rows[0] || null;
};

// Find raw user (with password) by id – for password change validation
export const findRawUserById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};
