import express from "express";
import {
  register,
  login,
  me,
  refreshToken,
  logout,
  verifyEmailHandler,
  passwordResetRequest,
  passwordResetConfirm,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmailHandler);
router.post("/password-reset/request", passwordResetRequest);
router.post("/password-reset/confirm", passwordResetConfirm);
router.get("/me", authenticate, me);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
