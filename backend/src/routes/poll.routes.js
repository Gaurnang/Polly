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


router.get("/", optionalAuthenticate, getAllPollsHandler);

router.get("/:id", optionalAuthenticate, getPollByIdHandler);

router.post("/", authenticate, createPollHandler);

router.put("/:id", authenticate, updatePollHandler);

router.delete("/:id", authenticate, deletePollHandler);

router.patch("/:id/close", authenticate, closePollHandler);

export default router;
