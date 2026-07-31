import {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  closePoll,
  getMyPolls,
  getMyVotedPolls,
} from "../services/poll.service.js";

export const createPollHandler = async (req, res) => {
  try {
    const { question, poll_type, options } = req.body;
    const poll = await createPoll({ question, poll_type, options }, req.user.id);
    return res.status(201).json({ success: true, message: "Poll created successfully.", data: { poll } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const getAllPollsHandler = async (req, res) => {
  try {
    const { cursor, limit, poll_type, is_active } = req.query;
    const result = await getAllPolls(req.user?.id, { cursor, limit, poll_type, is_active });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const getPollByIdHandler = async (req, res) => {
  try {
    const poll = await getPollById(req.params.id, req.user?.id);
    return res.status(200).json({ success: true, data: { poll } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const updatePollHandler = async (req, res) => {
  try {
    const poll = await updatePoll(req.params.id, req.body, req.user.id);
    return res.status(200).json({ success: true, message: "Poll updated successfully.", data: { poll } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const deletePollHandler = async (req, res) => {
  try {
    await deletePoll(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Poll deleted successfully." });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const closePollHandler = async (req, res) => {
  try {
    const poll = await closePoll(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Poll closed successfully.", data: { poll } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const getMyPollsHandler = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const result = await getMyPolls(req.user.id, { cursor, limit });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const getMyVotedPollsHandler = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const result = await getMyVotedPolls(req.user.id, { cursor, limit });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};
