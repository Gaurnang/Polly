import pool from "../config/db.js";

// Check if user already responded to a poll
export const findResponse = async (poll_id, user_id) => {
  const result = await pool.query(
    `SELECT * FROM poll_responses WHERE poll_id = $1 AND user_id = $2`,
    [poll_id, user_id]
  );
  return result.rows[0] || null;
};

// Submit a new response
export const insertResponse = async ({
  poll_id,
  user_id,
  option_id = null,
  rating = null,
  text_response = null,
  boolean_response = null,
}) => {
  const result = await pool.query(
    `INSERT INTO poll_responses
       (poll_id, user_id, option_id, rating, text_response, boolean_response)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [poll_id, user_id, option_id, rating, text_response, boolean_response]
  );
  return result.rows[0];
};

// Update an existing response
export const updateResponseRecord = async (
  poll_id,
  user_id,
  {
    option_id = null,
    rating = null,
    text_response = null,
    boolean_response = null,
  }
) => {
  const result = await pool.query(
    `UPDATE poll_responses
     SET
       option_id       = $3,
       rating          = $4,
       text_response   = $5,
       boolean_response = $6
     WHERE poll_id = $1 AND user_id = $2
     RETURNING *`,
    [poll_id, user_id, option_id, rating, text_response, boolean_response]
  );
  return result.rows[0] || null;
};

// Delete a response
export const deleteResponseRecord = async (poll_id, user_id) => {
  const result = await pool.query(
    `DELETE FROM poll_responses
     WHERE poll_id = $1 AND user_id = $2
     RETURNING *`,
    [poll_id, user_id]
  );
  return result.rows[0] || null;
};
