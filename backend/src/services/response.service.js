import pool from "../config/db.js";

export const createResponse = async (pollId, userId, body) => { 

    const pollResult = await pool.query(
        `
        SELECT *
        FROM polls
        WHERE id = $1
        `,
        [pollId]
    );

    if (!pollResult.rows.length) {
        throw new Error("Poll not found");
    }

    const poll = pollResult.rows[0];

    if (!poll.is_active) {
        throw new Error("Poll is closed");
    }

    const existing = await pool.query(
        `
        SELECT *
        FROM poll_responses
        WHERE poll_id = $1
        AND user_id = $2
        `,
        [pollId, userId]
    );

    if (existing.rows.length) {
        throw new Error("You have already responded to this poll.");
    }

    if (poll.poll_type === "yes_no") {

        if (typeof body.booleanResponse !== "boolean") {
            throw new Error("booleanResponse is required");
        }

        const result = await pool.query(
            `
            INSERT INTO poll_responses
            (
                poll_id,
                user_id,
                boolean_response
            )
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [
                pollId,
                userId,
                body.booleanResponse
            ]
        );

        return result.rows[0];
    }

    if (poll.poll_type === "single_choice") {

        if (!body.optionId) {
            throw new Error("optionId is required");
        }

        const option = await pool.query(
            `
            SELECT *
            FROM poll_options
            WHERE id = $1
            AND poll_id = $2
            `,
            [
                body.optionId,
                pollId
            ]
        );

        if (!option.rows.length) {
            throw new Error("Invalid option");
        }

        const result = await pool.query(
            `
            INSERT INTO poll_responses
            (
                poll_id,
                user_id,
                option_id
            )
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [
                pollId,
                userId,
                body.optionId
            ]
        );

        return result.rows[0];

    }

    if (poll.poll_type === "star_rating") {

        if (
            !body.rating ||
            body.rating < 1 ||
            body.rating > 5
        ) {

            throw new Error(
                "Rating must be between 1 and 5"
            );

        }

        const result = await pool.query(
            `
            INSERT INTO poll_responses
            (
                poll_id,
                user_id,
                rating
            )
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [
                pollId,
                userId,
                body.rating
            ]
        );

        return result.rows[0];

    }

    if (poll.poll_type === "open_ended") {

        if (
            !body.textResponse ||
            body.textResponse.trim() === ""
        ) {

            throw new Error(
                "Response cannot be empty"
            );

        }

        const result = await pool.query(
            `
            INSERT INTO poll_responses
            (
                poll_id,
                user_id,
                text_response
            )
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [
                pollId,
                userId,
                body.textResponse
            ]
        );

        return result.rows[0];

    }

    throw new Error("Invalid poll type");

};

//submit reponse
export const submitResponseService = async (pollId, userId, data) => {

  const {
    option_id,
    rating,
    text_response,
    boolean_response,
  } = data;

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

  // ----------------------------------
  // Poll Active?
  // ----------------------------------

  if (!poll.is_active) {
    throw new Error("Poll is closed.");
  }

  // ----------------------------------
  // Already Responded?
  // ----------------------------------

  const responseResult = await pool.query(
    `
    SELECT *
    FROM poll_responses
    WHERE poll_id = $1
    AND user_id = $2
    `,
    [pollId, userId]
  );

  if (responseResult.rows.length) {
    throw new Error("You have already responded to this poll.");
  }

  // ----------------------------------
  // Validate According To Poll Type
  // ----------------------------------

  switch (poll.poll_type) {

    case "boolean":

      if (typeof boolean_response !== "boolean") {
        throw new Error(
          "Boolean response is required."
        );
      }

      break;

    case "rating":

      if (
        rating === undefined ||
        rating < 1 ||
        rating > 5
      ) {
        throw new Error(
          "Rating must be between 1 and 5."
        );
      }

      break;

    case "text":

      if (
        !text_response ||
        text_response.trim() === ""
      ) {
        throw new Error(
          "Text response is required."
        );
      }

      break;

    case "single_choice":

      if (!option_id) {
        throw new Error(
          "Option is required."
        );
      }

      // -------------------------------
      // Check Option Belongs To Poll
      // -------------------------------

      const optionResult = await pool.query(
        `
        SELECT *
        FROM poll_options
        WHERE id = $1
        AND poll_id = $2
        `,
        [option_id, pollId]
      );

      if (!optionResult.rows.length) {
        throw new Error(
          "Invalid poll option."
        );
      }

      break;

    default:
      throw new Error("Invalid poll type.");
  }

  const result = await pool.query(
    `
    INSERT INTO poll_responses
    (
      poll_id,
      user_id,
      option_id,
      rating,
      text_response,
      boolean_response
    )
    VALUES
    ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [
      pollId,
      userId,
      option_id || null,
      rating || null,
      text_response || null,
      boolean_response ?? null,
    ]
  );

  return result.rows[0];
};


export const updateResponseService = async (
  pollId,
  userId,
  data
) => {

  const {
    option_id,
    rating,
    text_response,
    boolean_response,
  } = data;


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


  if (!poll.is_active) {
    throw new Error("Poll is closed.");
  }

  const responseResult = await pool.query(
    `
    SELECT *
    FROM poll_responses
    WHERE poll_id=$1
    AND user_id=$2
    `,
    [pollId, userId]
  );

  if (!responseResult.rows.length) {
    throw new Error("Response not found.");
  }

  // ----------------------------------
  // Validation
  // ----------------------------------

  switch (poll.poll_type) {

    case "boolean":

      if (typeof boolean_response !== "boolean") {
        throw new Error("Boolean response required.");
      }

      break;

    case "rating":

      if (
        rating === undefined ||
        rating < 1 ||
        rating > 5
      ) {
        throw new Error("Rating must be between 1 and 5.");
      }

      break;

    case "text":

      if (
        !text_response ||
        text_response.trim() === ""
      ) {
        throw new Error("Text response required.");
      }

      break;

    case "single_choice":

      if (!option_id) {
        throw new Error("Option required.");
      }

      const optionResult = await pool.query(
        `
        SELECT *
        FROM poll_options
        WHERE id=$1
        AND poll_id=$2
        `,
        [option_id, pollId]
      );

      if (!optionResult.rows.length) {
        throw new Error("Invalid option.");
      }

      break;

  }

  // ----------------------------------
  // Update
  // ----------------------------------

  const result = await pool.query(
    `
    UPDATE poll_responses
    SET

        option_id=$1,

        rating=$2,

        text_response=$3,

        boolean_response=$4

    WHERE

        poll_id=$5

    AND

        user_id=$6

    RETURNING *
    `,
    [
      option_id || null,
      rating || null,
      text_response || null,
      boolean_response ?? null,
      pollId,
      userId,
    ]
  );

  return result.rows[0];

};


export const deleteResponseService = async (
  pollId,
  userId
) => {

  const response = await pool.query(
    `
    SELECT *
    FROM poll_responses
    WHERE poll_id=$1
    AND user_id=$2
    `,
    [pollId, userId]
  );

  if (!response.rows.length) {
    throw new Error("Response not found.");
  }

  await pool.query(
    `
    DELETE FROM poll_responses
    WHERE poll_id=$1
    AND user_id=$2
    `,
    [pollId, userId]
  );

};