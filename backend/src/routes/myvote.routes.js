import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getMyVotedPollsHandler } from "../controllers/poll.controller.js";

const router = express.Router();

// GET /api/my-votes - protected
router.get("/", authenticate, getMyVotedPollsHandler);

export default router;
