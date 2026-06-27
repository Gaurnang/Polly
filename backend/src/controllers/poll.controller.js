import {
  createPollService,
  getAllPollsService,
  getPollByIdService,
  updatePollService,
  deletePollService,
  closePollService,
} from "../services/poll.service.js";


export const createPoll = async (req, res) => {
  try {
    const poll = await createPollService(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Poll created successfully.",
      poll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllPolls = async (req, res) => {
  try {
    const polls = await getAllPollsService(req.query);

    return res.status(200).json({
      success: true,
      count: polls.length,
      polls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPollById = async (req, res) => {
  try {
    const poll = await getPollByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      poll,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


export const updatePoll = async (req, res) => {
  try {
    const updatedPoll = await updatePollService(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Poll updated successfully.",
      poll: updatedPoll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const deletePoll = async (req, res) => {
  try {
    await deletePollService(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Poll deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const closePoll = async (req, res) => {
  try {
    const poll = await closePollService(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Poll closed successfully.",
      poll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};