import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  submitResponseHandler,
  updateResponseHandler,
  deleteResponseHandler,
} from "../controllers/response.controller.js";

const router = express.Router();

// POST   /api/polls/:id/respond  — protected
router.post("/:id/respond", authenticate, submitResponseHandler);

// PUT    /api/polls/:id/respond  — protected
router.put("/:id/respond", authenticate, updateResponseHandler);

// DELETE /api/polls/:id/respond  — protected
router.delete("/:id/respond", authenticate, deleteResponseHandler);

export default router;