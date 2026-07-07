import express from "express";
import { getPollResultsHandler } from "../controllers/result.controller.js";

const router = express.Router();

// GET /api/polls/:id/results — public
router.get("/:id/results", getPollResultsHandler);

export default router;