import express from "express";

import {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  closePoll,
} from "../controllers/poll.controller.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", getAllPolls);

router.get("/:id", getPollById);

router.post("/", authenticate, createPoll);

router.put("/:id", authenticate, updatePoll);

router.delete("/:id", authenticate, deletePoll);

router.patch("/:id/close", authenticate, closePoll);

export default router;