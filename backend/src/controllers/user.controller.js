import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../services/user.service.js";

export const getProfileHandler = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const updateProfileHandler = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updated = await updateUserProfile(req.user.id, { username, email });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: updated },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const changePasswordHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });

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
