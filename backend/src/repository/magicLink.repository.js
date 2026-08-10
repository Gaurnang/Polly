import pool from "../config/db.js";

export const createToken = async ({
  userId,
  token,
  purpose,
  expiresAt,
}) => {
  const result = await pool.query(
    `INSERT INTO magic_link_tokens
      (user_id, token, purpose, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, token, purpose, expiresAt]
  );

  return result.rows[0];
};

export const findTokenByValue = async (token) => {
  const result = await pool.query(
    `SELECT *
     FROM magic_link_tokens
     WHERE token = $1`,
    [token]
  );

  return result.rows[0] || null;
};

export const markTokenUsed = async (tokenId) => {
  await pool.query(
    `UPDATE magic_link_tokens
     SET used_at = NOW()
     WHERE id = $1`,
    [tokenId]
  );
};

export const invalidateActiveTokensForUser = async (
  userId,
  purpose
) => {
  await pool.query(
    `UPDATE magic_link_tokens
     SET used_at = NOW()
     WHERE user_id = $1
       AND purpose = $2
       AND used_at IS NULL
       AND expires_at > NOW()`,
    [userId, purpose]
  );
};