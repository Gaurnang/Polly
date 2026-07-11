import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  addBookmarkHandler,
  getBookmarksHandler,
  removeBookmarkHandler,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

router.post("/:pollId", authenticate, addBookmarkHandler);

router.get("/", authenticate, getBookmarksHandler);

router.delete("/:pollId", authenticate, removeBookmarkHandler);

export default router;