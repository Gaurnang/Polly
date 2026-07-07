import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getMyPollsHandler } from "../controllers/poll.controller.js";

const router = express.Router();

// GET /api/my-polls — protected
router.get("/", authenticate, getMyPollsHandler);

export default router;