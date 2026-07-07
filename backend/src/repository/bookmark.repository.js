import pool from "../config/db.js";

// Add a bookmark
export const insertBookmark = async (user_id, poll_id) => {
  const result = await pool.query(
    `INSERT INTO bookmark_polls (user_id, poll_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, poll_id) DO NOTHING
     RETURNING *`,
    [user_id, poll_id]
  );
  return result.rows[0] || null;
};

// Get all bookmarks for a user (with poll details)
export const findBookmarksByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT
       b.id           AS bookmark_id,
       b.created_at   AS bookmarked_at,
       p.id           AS poll_id,
       p.question,
       p.poll_type,
       p.is_active,
       p.created_at   AS poll_created_at,
       u.username     AS creator_username
     FROM bookmark_polls b
     JOIN polls p ON p.id = b.poll_id
     JOIN users u ON u.id = p.creator_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// Check if a bookmark already exists
export const findBookmark = async (user_id, poll_id) => {
  const result = await pool.query(
    `SELECT * FROM bookmark_polls WHERE user_id = $1 AND poll_id = $2`,
    [user_id, poll_id]
  );
  return result.rows[0] || null;
};

// Remove a bookmark
export const deleteBookmark = async (user_id, poll_id) => {
  const result = await pool.query(
    `DELETE FROM bookmark_polls
     WHERE user_id = $1 AND poll_id = $2
     RETURNING *`,
    [user_id, poll_id]
  );
  return result.rows[0] || null;
};
