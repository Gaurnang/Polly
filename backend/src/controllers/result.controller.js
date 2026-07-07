import { getPollResults } from "../services/result.service.js";

export const getPollResultsHandler = async (req, res) => {
  try {
    const results = await getPollResults(req.params.id);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};
