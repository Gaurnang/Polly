import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
} from "../controllers/user.controller.js";

const router = express.Router();

// GET  /api/users/profile          — protected
router.get("/profile", authenticate, getProfileHandler);

// PUT  /api/users/profile          — protected
router.put("/profile", authenticate, updateProfileHandler);

// PATCH /api/users/change-password — protected
router.patch("/change-password", authenticate, changePasswordHandler);

export default router;
