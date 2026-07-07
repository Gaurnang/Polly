import pool from "../config/db.js";

// Get results for a multiple-choice / single-choice poll
export const findChoiceResults = async (poll_id) => {
  const result = await pool.query(
    `SELECT
       po.id        AS option_id,
       po.option_text,
       COUNT(pr.id) AS vote_count
     FROM poll_options po
     LEFT JOIN poll_responses pr
       ON pr.option_id = po.id AND pr.poll_id = $1
     WHERE po.poll_id = $1
     GROUP BY po.id, po.option_text
     ORDER BY po.id ASC`,
    [poll_id]
  );
  return result.rows;
};

// Get results for a rating poll (average + distribution)
export const findRatingResults = async (poll_id) => {
  const result = await pool.query(
    `SELECT
       ROUND(AVG(rating), 2)  AS average_rating,
       COUNT(*)               AS total_responses,
       rating,
       COUNT(*)               AS count
     FROM poll_responses
     WHERE poll_id = $1 AND rating IS NOT NULL
     GROUP BY rating
     ORDER BY rating ASC`,
    [poll_id]
  );
  return result.rows;
};

// Get results for a text poll
export const findTextResults = async (poll_id) => {
  const result = await pool.query(
    `SELECT
       pr.id,
       u.username,
       pr.text_response,
       pr.created_at
     FROM poll_responses pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.poll_id = $1 AND pr.text_response IS NOT NULL
     ORDER BY pr.created_at DESC`,
    [poll_id]
  );
  return result.rows;
};

// Get results for a boolean (yes/no) poll
export const findBooleanResults = async (poll_id) => {
  const result = await pool.query(
    `SELECT
       boolean_response,
       COUNT(*) AS count
     FROM poll_responses
     WHERE poll_id = $1 AND boolean_response IS NOT NULL
     GROUP BY boolean_response`,
    [poll_id]
  );
  return result.rows;
};

// Get total response count for a poll
export const findTotalResponses = async (poll_id) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM poll_responses WHERE poll_id = $1`,
    [poll_id]
  );
  return parseInt(result.rows[0].total, 10);
};
