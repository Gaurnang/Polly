import pool from "../config/db.js";


export const createPollService = async (data, creatorId) => {
  const { question, pollType, options } = data;

  if (!question || question.trim() === "") {
    throw new Error("Question is required.");
  }

  const validTypes = [
    "boolean",
    "single_choice",
    "rating",
    "text",
  ];

  if (!validTypes.includes(pollType)) {
    throw new Error("Invalid poll type.");
  }

  if (
    pollType === "single_choice" &&
    (!options || options.length < 2)
  ) {
    throw new Error(
      "Single choice polls require at least 2 options."
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pollResult = await client.query(
      `
      INSERT INTO polls
      (
        question,
        poll_type,
        creator_id
      )
      VALUES
      ($1,$2,$3)
      RETURNING *
      `,
      [question, pollType, creatorId]
    );

    const poll = pollResult.rows[0];

    if (pollType === "single_choice") {
      for (const option of options) {
        await client.query(
          `
          INSERT INTO poll_options
          (
            poll_id,
            option_text
          )
          VALUES
          ($1,$2)
          `,
          [poll.id, option]
        );
      }
    }

    await client.query("COMMIT");

    return poll;
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};

export const getAllPollsService = async () => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.question,
      p.poll_type,
      p.is_active,
      p.created_at,

      u.id AS creator_id,
      u.username

    FROM polls p

    JOIN users u
      ON p.creator_id = u.id

    ORDER BY p.created_at DESC
    `
  );

  return result.rows;
};

export const getPollByIdService = async (pollId) => {
  const pollResult = await pool.query(
    `
    SELECT

      p.id,
      p.question,
      p.poll_type,
      p.is_active,
      p.created_at,

      u.id AS creator_id,
      u.username

    FROM polls p

    JOIN users u
      ON p.creator_id = u.id

    WHERE p.id = $1
    `,
    [pollId]
  );

  if (!pollResult.rows.length) {
    throw new Error("Poll not found.");
  }

  const poll = pollResult.rows[0];

  const optionResult = await pool.query(
    `
    SELECT
      id,
      option_text
    FROM poll_options
    WHERE poll_id = $1
    ORDER BY id
    `,
    [pollId]
  );

  poll.options = optionResult.rows;

  return poll;
};

export const updatePollService = async (
  pollId,
  userId,
  data
) => {
  const { question } = data;

  const pollResult = await pool.query(
    `
    SELECT *
    FROM polls
    WHERE id = $1
    `,
    [pollId]
  );

  if (!pollResult.rows.length) {
    throw new Error("Poll not found.");
  }

  const poll = pollResult.rows[0];

  if (poll.creator_id !== userId) {
    throw new Error("Unauthorized.");
  }

  const updatedPoll = await pool.query(
    `
    UPDATE polls
    SET question = $1
    WHERE id = $2
    RETURNING *
    `,
    [
      question ?? poll.question,
      pollId,
    ]
  );

  return updatedPoll.rows[0];
};

export const deletePollService = async (
  pollId,
  userId
) => {

  const pollResult = await pool.query(
    `
    SELECT *
    FROM polls
    WHERE id = $1
    `,
    [pollId]
  );

  if (!pollResult.rows.length) {
    throw new Error("Poll not found.");
  }

  const poll = pollResult.rows[0];

  if (poll.creator_id !== userId) {
    throw new Error("Unauthorized.");
  }

  await pool.query(
    `
    DELETE FROM polls
    WHERE id = $1
    `,
    [pollId]
  );
};

export const closePollService = async (
  pollId,
  userId
) => {

  const pollResult = await pool.query(
    `
    SELECT *
    FROM polls
    WHERE id = $1
    `,
    [pollId]
  );

  if (!pollResult.rows.length) {
    throw new Error("Poll not found.");
  }

  const poll = pollResult.rows[0];

  if (poll.creator_id !== userId) {
    throw new Error("Unauthorized.");
  }

  const result = await pool.query(
    `
    UPDATE polls
    SET is_active = false
    WHERE id = $1
    RETURNING *
    `,
    [pollId]
  );

  return result.rows[0];
};