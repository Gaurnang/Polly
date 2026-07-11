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
    const creator_id = req.user.id;

    const poll = await createPoll({ question, poll_type, options }, creator_id);

    return res.status(201).json({
      success: true,
      message: "Poll created successfully.",
      data: { poll },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getAllPollsHandler = async (req, res) => {
  try {
    const { page, poll_type, is_active } = req.query;
    const filters = {
      page: parseInt(page, 10) || 1,
      limit: 10,
      poll_type,
      is_active
    };
    const result = await getAllPolls(req.user?.id, filters);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getPollByIdHandler = async (req, res) => {
  try {
    const poll = await getPollById(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      data: { poll },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const updatePollHandler = async (req, res) => {
  try {
    const poll = await updatePoll(
      req.params.id,
      req.body,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Poll updated successfully.",
      data: { poll },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const deletePollHandler = async (req, res) => {
  try {
    await deletePoll(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Poll deleted successfully.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const closePollHandler = async (req, res) => {
  try {
    const poll = await closePoll(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Poll closed successfully.",
      data: { poll },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getMyPollsHandler = async (req, res) => {
  try {
    const polls = await getMyPolls(req.user.id);
    return res.status(200).json({
      success: true,
      data: { polls },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getMyVotedPollsHandler = async (req, res) => {
  try {
    const polls = await getMyVotedPolls(req.user.id);
    return res.status(200).json({
      success: true,
      data: { polls },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};
