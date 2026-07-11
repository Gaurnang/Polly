import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getMyVotedPollsHandler } from "../controllers/poll.controller.js";

const router = express.Router();

router.get("/", authenticate, getMyVotedPollsHandler);

export default router;
