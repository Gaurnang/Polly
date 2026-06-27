import express from "express";

import authenticate from "../middleware/authenticate.js";

import {
  submitResponse,
  updateResponse,
  deleteResponse,
} from "../controllers/response.controller.js";

const router = express.Router();

router.post("/:id/respond", authenticate, submitResponse);

router.put("/:id/respond", authenticate, updateResponse);

router.delete("/:id/respond", authenticate, deleteResponse);

export default router;