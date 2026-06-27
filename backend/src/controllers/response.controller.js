import {
  submitResponseService,
  updateResponseService,
  deleteResponseService,
} from "../services/response.service.js";

export const submitResponse = async (req, res) => {
  try {
    const response = await submitResponseService(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Response submitted successfully.",
      response,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateResponse = async (req, res) => {
  try {
    const response = await updateResponseService(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Response updated successfully.",
      response,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteResponse = async (req, res) => {
  try {
    await deleteResponseService(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Response deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};