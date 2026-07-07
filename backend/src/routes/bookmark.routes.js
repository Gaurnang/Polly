import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  addBookmarkHandler,
  getBookmarksHandler,
  removeBookmarkHandler,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

// POST   /api/bookmarks/:pollId — protected
router.post("/:pollId", authenticate, addBookmarkHandler);

// GET    /api/bookmarks         — protected
router.get("/", authenticate, getBookmarksHandler);

// DELETE /api/bookmarks/:pollId — protected
router.delete("/:pollId", authenticate, removeBookmarkHandler);

export default router;