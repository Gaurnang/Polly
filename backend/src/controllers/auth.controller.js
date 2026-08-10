import {
  registerUser,
  resendVerificationEmail,
  loginUser,
  getMe,
  refreshAccessToken,
  requestPasswordReset,
  confirmPasswordReset
} from "../services/auth.service.js";

import {
  verifyEmail,
} from "../services/magicLink.service.js";


export const register = async (req, res) => {
  try {
    // 1. Get data from frontend
    const { email, username, password } = req.body;

    // 2. Check required fields
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "email, username, and password are required.",
      });
    }

    // 3. Send data to service
    const user = await registerUser({
      email,
      username,
      password,
    });

    // 4. Send success response
    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user,
      },
    });
  } catch (err) {
    // 5. Handle errors
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const verifyEmailHandler = async (req, res) => {
  try {
    // 1. Get token from URL
    const { token } = req.query;

    // 2. Make sure token exists
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    // 3. Verify the token
    const user = await verifyEmail(token);

    // 4. Send response
    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: {
        user,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required.",
      });
    }

    const result = await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res) => {
  try {
    // 1. Get login data
    const { email, password } = req.body;

    // 2. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required.",
      });
    }

    // 3. Let service authenticate user
    const {
      user,
      accessToken,
      refreshToken,
    } = await loginUser({
      email,
      password,
    });

    // 4. Store refresh token in HTTP-only cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      REFRESH_COOKIE_OPTIONS
    );

    // 5. Return access token to frontend
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        accessToken,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
};

export const me = async (req, res) => {
  try {
    // authenticate middleware created req.user
    const user = await getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from HTTP-only cookie
    const token = req.cookies?.refreshToken;

    // Verify it and create a new access token
    const newAccessToken = refreshAccessToken(token);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const passwordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required.",
      });
    }

    const result = await requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
};

export const passwordResetConfirm = async (
  req,
  res
) => {
  try {
    const {
      token,
      newPassword,
    } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "token and newPassword are required.",
      });
    }

    const result =
      await confirmPasswordReset(
        token,
        newPassword
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
};