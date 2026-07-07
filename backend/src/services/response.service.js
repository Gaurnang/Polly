import {
  findResponse,
  insertResponse,
  updateResponseRecord,
  deleteResponseRecord,
} from "../repository/response.repository.js";

import { findPollById, findOptionsByPollId } from "../repository/poll.repository.js";

const validatePayload = async (poll, body) => {
  const { poll_type } = poll;
  const { option_id, rating, text_response, boolean_response } = body;

  switch (poll_type) {
    case "single":
    case "single_choice": {
      if (option_id == null) {
        throw { status: 400, message: "option_id is required for single-choice polls." };
      }
      const options = await findOptionsByPollId(poll.id);
      const valid = options.some((o) => String(o.id) === String(option_id));
      if (!valid) {
        throw { status: 400, message: "option_id does not belong to this poll." };
      }
      return { option_id, rating: null, text_response: null, boolean_response: null };
    }

    case "rating": {
      if (rating == null) {
        throw { status: 400, message: "rating is required for rating polls." };
      }
      const r = parseInt(rating, 10);
      if (isNaN(r) || r < 1 || r > 5) {
        throw { status: 400, message: "rating must be an integer between 1 and 5." };
      }
      return { option_id: null, rating: r, text_response: null, boolean_response: null };
    }

    case "text": {
      if (!text_response || !String(text_response).trim()) {
        throw { status: 400, message: "text_response is required for text polls." };
      }
      return { option_id: null, rating: null, text_response: String(text_response).trim(), boolean_response: null };
    }

    case "boolean": {
      if (boolean_response == null) {
        throw { status: 400, message: "boolean_response is required for yes/no polls." };
      }
      return { option_id: null, rating: null, text_response: null, boolean_response: Boolean(boolean_response) };
    }

    default:
      throw { status: 400, message: "Unknown poll type." };
  }
};

export const submitResponse = async (poll_id, user_id, body) => {
  const poll = await findPollById(poll_id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  if (!poll.is_active) {
    throw { status: 403, message: "This poll is closed and no longer accepting responses." };
  }

  const existing = await findResponse(poll_id, user_id);
  if (existing) {
    throw { status: 409, message: "You have already responded to this poll." };
  }

  const payload = await validatePayload(poll, body);

  return await insertResponse({ poll_id, user_id, ...payload });
};

export const updateResponse = async (poll_id, user_id, body) => {
  const poll = await findPollById(poll_id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }
  if (!poll.is_active) {
    throw { status: 403, message: "This poll is closed." };
  }

  const existing = await findResponse(poll_id, user_id);
  if (!existing) {
    throw { status: 404, message: "No existing response found to update." };
  }

  const payload = await validatePayload(poll, body);

  return await updateResponseRecord(poll_id, user_id, payload);
};

export const deleteResponse = async (poll_id, user_id) => {
  const existing = await findResponse(poll_id, user_id);
  if (!existing) {
    throw { status: 404, message: "No response found to delete." };
  }

  return await deleteResponseRecord(poll_id, user_id);
};
