import pool from "../config/db.js";

const DEFAULT_PAGE_SIZE = 15;

// ── Cursor helpers ────────────────────────────────────────────────────────────

export const encodeCursor = ({ id, created_at }) =>
  Buffer.from(JSON.stringify({ id, created_at })).toString("base64");

export const decodeCursor = (cursor) => {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
    if (!parsed.id || !parsed.created_at) throw new Error("missing fields");
    return parsed;
  } catch {
    throw { status: 400, message: "Invalid cursor" };
  }
};

const clampLimit = (raw) => {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(n, 1), 50);
};

// ── Create / options ──────────────────────────────────────────────────────────

export const createPollRecord = async ({ question, poll_type, creator_id }) => {
  // Normalize to DB canonical value
  const dbPollType = poll_type === "single" ? "single_choice" : poll_type;
  const result = await pool.query(
    `INSERT INTO polls (question, poll_type, creator_id) VALUES ($1, $2, $3) RETURNING *`,
    [question, dbPollType, creator_id]
  );
  return result.rows[0];
};

export const insertPollOption = async (poll_id, option_text) => {
  const result = await pool.query(
    `INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2) RETURNING *`,
    [poll_id, option_text]
  );
  return result.rows[0];
};

// ── findAllPolls (cursor pagination) ─────────────────────────────────────────

export const findAllPolls = async (user_id = null, filters = {}) => {
  const limit = clampLimit(filters.limit);
  const { poll_type, is_active, cursor } = filters;

  const values = [user_id];
  const conditions = [];

  if (poll_type && poll_type !== "all") {
    if (poll_type === "single") {
      conditions.push(`p.poll_type IN ('single', 'single_choice')`);
    } else {
      values.push(poll_type);
      conditions.push(`p.poll_type = $${values.length}`);
    }
  }
  if (is_active !== undefined && is_active !== "all") {
    values.push(is_active === "true" || is_active === true);
    conditions.push(`p.is_active = $${values.length}`);
  }

  if (cursor) {
    const { id: pid, created_at: cat } = decodeCursor(cursor);
    values.push(cat, pid);
    conditions.push(
      `(p.created_at < $${values.length - 1} OR (p.created_at = $${values.length - 1} AND p.id < $${values.length}))`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      p.id, p.question, p.poll_type, p.is_active, p.creator_id,
      u.username AS creator_username, p.created_at::text AS created_at,
      COUNT(DISTINCT po.id) AS option_count,
      COUNT(DISTINCT pr.id) AS response_count,
      COALESCE(BOOL_OR(user_pr.id IS NOT NULL), FALSE) AS has_voted
    FROM polls p
    JOIN users u ON p.creator_id = u.id
    LEFT JOIN poll_options po ON po.poll_id = p.id
    LEFT JOIN poll_responses pr ON pr.poll_id = p.id
    LEFT JOIN poll_responses user_pr ON user_pr.poll_id = p.id AND user_pr.user_id = $1
    ${whereClause}
    GROUP BY p.id, u.username
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${values.length + 1}`;

  values.push(limit + 1);
  const result = await pool.query(query, values);
  const rows = result.rows;
  const hasMore = rows.length > limit;
  const polls = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = polls[polls.length - 1];
  const nextCursor = hasMore && lastRow
    ? encodeCursor({ id: lastRow.id, created_at: lastRow.created_at })
    : null;

  return { polls, nextCursor, hasMore };
};

// ── findPollById ──────────────────────────────────────────────────────────────

export const findPollById = async (id, user_id = null) => {
  const pollResult = await pool.query(
    `SELECT
       p.id, p.question, p.poll_type, p.is_active, p.creator_id,
       u.username AS creator_username, p.created_at,
       COUNT(DISTINCT pr.id) AS response_count,
       COALESCE(BOOL_OR(user_pr.id IS NOT NULL), FALSE) AS has_voted
     FROM polls p
     JOIN users u ON p.creator_id = u.id
     LEFT JOIN poll_responses pr ON pr.poll_id = p.id
     LEFT JOIN poll_responses user_pr ON user_pr.poll_id = p.id AND user_pr.user_id = $2
     WHERE p.id = $1
     GROUP BY p.id, u.username`,
    [id, user_id]
  );
  if (!pollResult.rows[0]) return null;

  const optionsResult = await pool.query(
    `SELECT id, option_text, created_at FROM poll_options WHERE poll_id = $1 ORDER BY id ASC`,
    [id]
  );
  return { ...pollResult.rows[0], options: optionsResult.rows };
};

export const findOptionsByPollId = async (poll_id) => {
  const result = await pool.query(`SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id ASC`, [poll_id]);
  return result.rows;
};

export const updatePollRecord = async (id, { question, poll_type }) => {
  const result = await pool.query(
    `UPDATE polls SET question = COALESCE($1, question), poll_type = COALESCE($2, poll_type) WHERE id = $3 RETURNING *`,
    [question, poll_type, id]
  );
  return result.rows[0] || null;
};

export const deletePollOptions = async (poll_id) => {
  await pool.query(`DELETE FROM poll_options WHERE poll_id = $1`, [poll_id]);
};

export const deletePollRecord = async (id) => {
  const result = await pool.query(`DELETE FROM polls WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0] || null;
};

export const closePollRecord = async (id) => {
  const result = await pool.query(`UPDATE polls SET is_active = FALSE WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0] || null;
};

// ── findPollsByCreator (cursor pagination) ────────────────────────────────────

export const findPollsByCreator = async (creator_id, filters = {}) => {
  const limit = clampLimit(filters.limit);
  const { cursor } = filters;
  const values = [creator_id];
  const conditions = [`p.creator_id = $1`];

  if (cursor) {
    const { id: pid, created_at: cat } = decodeCursor(cursor);
    values.push(cat, pid);
    conditions.push(
      `(p.created_at < $${values.length - 1} OR (p.created_at = $${values.length - 1} AND p.id < $${values.length}))`
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const query = `
    SELECT
      p.id, p.question, p.poll_type, p.is_active, p.created_at::text AS created_at, p.creator_id,
      COUNT(po.id) AS option_count,
      COUNT(DISTINCT pr.id) AS response_count
    FROM polls p
    LEFT JOIN poll_options po ON po.poll_id = p.id
    LEFT JOIN poll_responses pr ON pr.poll_id = p.id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${values.length + 1}`;

  values.push(limit + 1);
  const result = await pool.query(query, values);
  const rows = result.rows;
  const hasMore = rows.length > limit;
  const polls = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = polls[polls.length - 1];
  const nextCursor = hasMore && lastRow
    ? encodeCursor({ id: lastRow.id, created_at: lastRow.created_at })
    : null;

  return { polls, nextCursor, hasMore };
};

// ── findPollsVotedByUser (cursor pagination) ──────────────────────────────────

export const findPollsVotedByUser = async (user_id, filters = {}) => {
  const limit = clampLimit(filters.limit);
  const { cursor } = filters;
  const values = [user_id];
  const conditions = [`voted.user_id = $1`];

  if (cursor) {
    const { id: pid, created_at: cat } = decodeCursor(cursor);
    values.push(cat, pid);
    conditions.push(
      `(p.created_at < $${values.length - 1} OR (p.created_at = $${values.length - 1} AND p.id < $${values.length}))`
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const query = `
    SELECT
      p.id, p.question, p.poll_type, p.is_active, p.creator_id,
      u.username AS creator_username, p.created_at::text AS created_at,
      voted.created_at AS voted_at,
      COUNT(DISTINCT po.id) AS option_count,
      COUNT(DISTINCT pr.id) AS response_count,
      TRUE AS has_voted
    FROM poll_responses voted
    JOIN polls p ON p.id = voted.poll_id
    JOIN users u ON p.creator_id = u.id
    LEFT JOIN poll_options po ON po.poll_id = p.id
    LEFT JOIN poll_responses pr ON pr.poll_id = p.id
    ${whereClause}
    GROUP BY p.id, u.username, voted.created_at
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${values.length + 1}`;

  values.push(limit + 1);
  const result = await pool.query(query, values);
  const rows = result.rows;
  const hasMore = rows.length > limit;
  const polls = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = polls[polls.length - 1];
  const nextCursor = hasMore && lastRow
    ? encodeCursor({ id: lastRow.id, created_at: lastRow.created_at })
    : null;

  return { polls, nextCursor, hasMore };
};
