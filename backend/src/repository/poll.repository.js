import pool from "../config/db.js";

// Create a poll (without options)
export const createPollRecord = async ({ question, poll_type, creator_id }) => {
  const result = await pool.query(
    `INSERT INTO polls (question, poll_type, creator_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [question, poll_type, creator_id]
  );
  return result.rows[0];
};

// Insert a single poll option
export const insertPollOption = async (poll_id, option_text) => {
  const result = await pool.query(
    `INSERT INTO poll_options (poll_id, option_text)
     VALUES ($1, $2)
     RETURNING *`,
    [poll_id, option_text]
  );
  return result.rows[0];
};

export const findAllPolls = async (user_id = null, filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;
  const { poll_type, is_active } = filters;
  const offset = (page - 1) * limit;

  let baseQuery = `FROM polls p
     JOIN users u ON p.creator_id = u.id
     LEFT JOIN poll_options po ON po.poll_id = p.id
     LEFT JOIN poll_responses pr ON pr.poll_id = p.id
     LEFT JOIN poll_responses user_pr
       ON user_pr.poll_id = p.id AND user_pr.user_id = $1`;

  const values = [user_id];
  const conditions = [];

  if (poll_type && poll_type !== 'all') {
    values.push(poll_type);
    conditions.push(`p.poll_type = $${values.length}`);
  }

  if (is_active !== undefined && is_active !== 'all') {
    values.push(is_active === 'true' || is_active === true);
    conditions.push(`p.is_active = $${values.length}`);
  }

  let whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : '';

  // Get total count for pagination metadata
  const countQuery = `SELECT COUNT(DISTINCT p.id) AS total_count ${baseQuery} ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const totalCount = parseInt(countResult.rows[0].total_count, 10);

  let query = `SELECT
       p.id,
       p.question,
       p.poll_type,
       p.is_active,
       p.creator_id,
       u.username AS creator_username,
       p.created_at,
       COUNT(DISTINCT po.id) AS option_count,
       COUNT(DISTINCT pr.id) AS response_count,
       COALESCE(BOOL_OR(user_pr.id IS NOT NULL), FALSE) AS has_voted
     ${baseQuery} ${whereClause}
     GROUP BY p.id, u.username
     ORDER BY p.created_at DESC`;

  values.push(limit, offset);
  query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await pool.query(query, values);
  return {
    polls: result.rows,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

// Get a single poll by ID including its options
export const findPollById = async (id, user_id = null) => {
  const pollResult = await pool.query(
    `SELECT
       p.id,
       p.question,
       p.poll_type,
       p.is_active,
       p.creator_id,
       u.username AS creator_username,
       p.created_at,
       COUNT(DISTINCT pr.id) AS response_count,
       COALESCE(BOOL_OR(user_pr.id IS NOT NULL), FALSE) AS has_voted
     FROM polls p
     JOIN users u ON p.creator_id = u.id
     LEFT JOIN poll_responses pr ON pr.poll_id = p.id
     LEFT JOIN poll_responses user_pr
       ON user_pr.poll_id = p.id AND user_pr.user_id = $2
     WHERE p.id = $1
     GROUP BY p.id, u.username`,
    [id, user_id]
  );
  if (!pollResult.rows[0]) return null;

  const optionsResult = await pool.query(
    `SELECT id, option_text, created_at
     FROM poll_options
     WHERE poll_id = $1
     ORDER BY id ASC`,
    [id]
  );

  return {
    ...pollResult.rows[0],
    options: optionsResult.rows,
  };
};

// Get options of a poll
export const findOptionsByPollId = async (poll_id) => {
  const result = await pool.query(
    `SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id ASC`,
    [poll_id]
  );
  return result.rows;
};

// Update poll question / poll_type
export const updatePollRecord = async (id, { question, poll_type }) => {
  const result = await pool.query(
    `UPDATE polls
     SET question = COALESCE($1, question),
         poll_type = COALESCE($2, poll_type)
     WHERE id = $3
     RETURNING *`,
    [question, poll_type, id]
  );
  return result.rows[0] || null;
};

// Delete all options of a poll (used before re-inserting)
export const deletePollOptions = async (poll_id) => {
  await pool.query(`DELETE FROM poll_options WHERE poll_id = $1`, [poll_id]);
};

// Delete poll by ID
export const deletePollRecord = async (id) => {
  const result = await pool.query(
    `DELETE FROM polls WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

// Close (deactivate) a poll
export const closePollRecord = async (id) => {
  const result = await pool.query(
    `UPDATE polls SET is_active = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

// Get all polls created by a specific user
export const findPollsByCreator = async (creator_id) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.question,
       p.poll_type,
       p.is_active,
       p.created_at,
       COUNT(po.id) AS option_count,
       COUNT(DISTINCT pr.id) AS response_count
     FROM polls p
     LEFT JOIN poll_options po ON po.poll_id = p.id
     LEFT JOIN poll_responses pr ON pr.poll_id = p.id
     WHERE p.creator_id = $1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [creator_id]
  );
  return result.rows;
};

// Get all polls a user has voted on.
export const findPollsVotedByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.question,
       p.poll_type,
       p.is_active,
       p.creator_id,
       u.username AS creator_username,
       p.created_at,
       voted.created_at AS voted_at,
       COUNT(DISTINCT po.id) AS option_count,
       COUNT(DISTINCT pr.id) AS response_count,
       TRUE AS has_voted
     FROM poll_responses voted
     JOIN polls p ON p.id = voted.poll_id
     JOIN users u ON p.creator_id = u.id
     LEFT JOIN poll_options po ON po.poll_id = p.id
     LEFT JOIN poll_responses pr ON pr.poll_id = p.id
     WHERE voted.user_id = $1
     GROUP BY p.id, u.username, voted.created_at
     ORDER BY voted.created_at DESC`,
    [user_id]
  );
  return result.rows;
};
