import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../services/bookmark.service.js";

export const addBookmarkHandler = async (req, res) => {
  try {
    const user_id = req.user.id;
    const poll_id = req.params.pollId;

    const bookmark = await addBookmark(user_id, poll_id);

    return res.status(201).json({
      success: true,
      message: "Poll bookmarked successfully.",
      data: { bookmark },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getBookmarksHandler = async (req, res) => {
  try {
    const user_id = req.user.id;
    const bookmarks = await getBookmarks(user_id);

    return res.status(200).json({
      success: true,
      data: { bookmarks },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const removeBookmarkHandler = async (req, res) => {
  try {
    const user_id = req.user.id;
    const poll_id = req.params.pollId;

    await removeBookmark(user_id, poll_id);

    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};
