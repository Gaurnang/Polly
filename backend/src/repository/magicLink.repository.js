import pool from "../config/db.js";

export const createToken = async ({ userId, token, purpose, expiresAt }) => {
  const result = await pool.query(
    `INSERT INTO magic_link_tokens (user_id, token, purpose, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, token, purpose, expiresAt]
  );
  return result.rows[0];
};

export const findTokenByValue = async (token) => {
  const result = await pool.query(
    `SELECT mlt.*, u.email, u.username
     FROM magic_link_tokens mlt
     JOIN users u ON u.id = mlt.user_id
     WHERE mlt.token = $1`,
    [token]
  );
  return result.rows[0] || null;
};

export const markTokenUsed = async (tokenId, client = pool) => {
  await client.query(
    `UPDATE magic_link_tokens SET used_at = NOW() WHERE id = $1`,
    [tokenId]
  );
};

export const invalidateActiveTokensForUser = async (userId, purpose) => {
  await pool.query(
    `UPDATE magic_link_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW()`,
    [userId, purpose]
  );
};

export const cleanupTokens = async (userId) => {
  const result = await pool.query(
    `DELETE FROM magic_link_tokens
     WHERE user_id = $1 AND (expires_at < NOW() OR used_at IS NOT NULL)`,
    [userId]
  );
  return result.rowCount;
};
