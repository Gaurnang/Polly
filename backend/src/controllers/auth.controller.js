import {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  verifyEmail,
  requestPasswordReset,
  confirmPasswordReset,
} from "../services/auth.service.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ success: false, message: "email, username, and password are required." });

    const result = await registerUser({ email, username, password });
    return res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const verifyEmailHandler = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "token query parameter is required" });

    const { user, accessToken, refreshToken } = await verifyEmail(token);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Email verified successfully.", data: { user, accessToken } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "email and password are required." });

    const { user, accessToken, refreshToken } = await loginUser({ email, password });
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Login successful.", data: { user, accessToken } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const me = async (req, res) => {
  try {
    const user = await getMe(req.user.id);
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const newAccessToken = refreshAccessToken(token);
    return res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const passwordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "email is required." });

    const result = await requestPasswordReset(email);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};

export const passwordResetConfirm = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "token and newPassword are required." });

    const result = await confirmPasswordReset(token, newPassword);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
  }
};
