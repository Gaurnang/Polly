import express from "express";
import {
  register,
  login,
  me,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET  /api/auth/me  (protected)
router.get("/me", authenticate, me);

// POST /api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/auth/logout
router.post("/logout", logout);

export default router;