import {
  insertBookmark,
  findBookmarksByUser,
  findBookmark,
  deleteBookmark,
} from "../repository/bookmark.repository.js";

import { findPollById } from "../repository/poll.repository.js";

export const addBookmark = async (user_id, poll_id) => {
  const poll = await findPollById(poll_id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }

  const existing = await findBookmark(user_id, poll_id);
  if (existing) {
    throw { status: 409, message: "Poll is already bookmarked." };
  }

  return await insertBookmark(user_id, poll_id);
};

export const getBookmarks = async (user_id) => {
  return await findBookmarksByUser(user_id);
};

export const removeBookmark = async (user_id, poll_id) => {
  const existing = await findBookmark(user_id, poll_id);
  if (!existing) {
    throw { status: 404, message: "Bookmark not found." };
  }

  return await deleteBookmark(user_id, poll_id);
};
