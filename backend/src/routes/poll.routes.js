import express from "express";
import {
  createPollHandler,
  getAllPollsHandler,
  getPollByIdHandler,
  updatePollHandler,
  deletePollHandler,
  closePollHandler,
} from "../controllers/poll.controller.js";
import authenticate from "../middleware/authenticate.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";

const router = express.Router();

// GET  /api/polls          — public
router.get("/", optionalAuthenticate, getAllPollsHandler);

// GET  /api/polls/:id      — public
router.get("/:id", optionalAuthenticate, getPollByIdHandler);

// POST /api/polls          — protected
router.post("/", authenticate, createPollHandler);

// PUT  /api/polls/:id      — protected (creator only)
router.put("/:id", authenticate, updatePollHandler);

// DELETE /api/polls/:id    — protected (creator only)
router.delete("/:id", authenticate, deletePollHandler);

// PATCH /api/polls/:id/close — protected (creator only)
router.patch("/:id/close", authenticate, closePollHandler);

export default router;
