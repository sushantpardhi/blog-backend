import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import BlogController from "../controllers/blogController.js"; // Updated import
import CommentController from "../controllers/commentController.js";

const router = express.Router();

// Comment Routes
router.post("/:blogId/comment/add", verifyToken, CommentController.addComment);
router.put(
  "/:blogId/comment/update/:commentId",
  verifyToken,
  CommentController.updateComment
);
router.put(
  "/:blogId/comment/like/:commentId",
  verifyToken,
  CommentController.likeComment
);
router.put(
  "/:blogId/comment/unlike/:commentId",
  verifyToken,
  CommentController.unlikeComment
);

// Blog Routes
router.get("/search", BlogController.searchBlog);
router.get("/filter/tags", BlogController.filterBlogByTags);
router.get("/filter/author", BlogController.filterBlogByAuthor);
router.post("/publish", verifyToken, BlogController.publishBlog);
router.delete("/delete", verifyToken, BlogController.deleteBlog);
router.put("/update/:blogId", verifyToken, BlogController.updateBlog);
router.put("/like/:blogId", verifyToken, BlogController.likeBlog);
router.put("/unlike/:blogId", verifyToken, BlogController.unlikeBlog);
router.get("/allblogs", BlogController.getAllBlogs);
router.get("/:id", BlogController.getBlogById);

export default router;
