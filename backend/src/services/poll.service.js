import {
  createPollRecord,
  insertPollOption,
  findAllPolls,
  findPollById,
  findOptionsByPollId,
  updatePollRecord,
  deletePollOptions,
  deletePollRecord,
  closePollRecord,
  findPollsByCreator,
  findPollsVotedByUser,
} from "../repository/poll.repository.js";

const VALID_POLL_TYPES = ["single", "rating", "text", "boolean"];

export const createPoll = async ({ question, poll_type, options }, creator_id) => {
  if (!question || !question.trim()) {
    throw { status: 400, message: "Poll question is required." };
  }

  if (!VALID_POLL_TYPES.includes(poll_type)) {
    throw {
      status: 400,
      message: `poll_type must be one of: ${VALID_POLL_TYPES.join(", ")}.`,
    };
  }

  // Choice polls require options
  if (
    (poll_type === "single" || poll_type === "single_choice") &&
    (!Array.isArray(options) || options.length < 2)
  ) {
    throw {
      status: 400,
      message: "Choice polls require at least 2 options.",
    };
  }

  const poll = await createPollRecord({ question: question.trim(), poll_type, creator_id });

  if (Array.isArray(options) && options.length > 0) {
    for (const optionText of options) {
      await insertPollOption(poll.id, optionText);
    }
  }

  const fullPoll = await findPollById(poll.id);
  return fullPoll;
};

export const getAllPolls = async (user_id = null, filters = {}) => {
  return await findAllPolls(user_id, filters);
};

export const getPollById = async (id, user_id = null) => {
  const poll = await findPollById(id, user_id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  return poll;
};

export const updatePoll = async (id, updates, requesterId) => {
  const poll = await findPollById(id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  if (String(poll.creator_id) !== String(requesterId)) {
    throw { status: 403, message: "Forbidden: you are not the poll creator." };
  }

  const { question, poll_type, options } = updates;

  if (poll_type && !VALID_POLL_TYPES.includes(poll_type)) {
    throw {
      status: 400,
      message: `poll_type must be one of: ${VALID_POLL_TYPES.join(", ")}.`,
    };
  }

  await updatePollRecord(id, { question, poll_type });

  // Replace options if provided
  if (Array.isArray(options)) {
    await deletePollOptions(id);
    for (const optionText of options) {
      await insertPollOption(id, optionText);
    }
  }

  return await findPollById(id);
};

export const deletePoll = async (id, requesterId) => {
  const poll = await findPollById(id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  if (String(poll.creator_id) !== String(requesterId)) {
    throw { status: 403, message: "Forbidden: you are not the poll creator." };
  }

  return await deletePollRecord(id);
};

export const closePoll = async (id, requesterId) => {
  const poll = await findPollById(id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  if (String(poll.creator_id) !== String(requesterId)) {
    throw { status: 403, message: "Forbidden: you are not the poll creator." };
  }
  if (!poll.is_active) {
    throw { status: 400, message: "Poll is already closed." };
  }

  return await closePollRecord(id);
};

export const getMyPolls = async (creator_id) => {
  return await findPollsByCreator(creator_id);
};

export const getMyVotedPolls = async (user_id) => {
  return await findPollsVotedByUser(user_id);
};
