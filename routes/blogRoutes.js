import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import blogController from "../controllers/blogController.js";
import CommentController from "../controllers/commentController.js";

const router = express.Router();
const comment = new CommentController();
const blog = new blogController();

//Comment Routes
router.post("/:blogId/comment/add", verifyToken, comment.addComment);
router.put(
  "/:blogId/comment/update/:commentId",
  verifyToken,
  comment.updateComment
);
router.put(
  "/:blogId/comment/like/:commentId",
  verifyToken,
  comment.likeComment
);
router.put(
  "/:blogId/comment/unlike/:commentId",
  verifyToken,
  comment.unlikeComment
);

// Nested Comment Routes
router.post(
  "/:blogId/comment/:parentId/reply",
  verifyToken,
  comment.replyToComment
);

//Blog Routes
router.get("/search", blog.searchBlog);
router.get("/filter/tags", blog.filterBlogByTags);
router.get("/filter/author", blog.filterBlogByAuthor);
router.post("/publish", verifyToken, blog.publishBlog);
router.delete("/delete", verifyToken, blog.deleteBlog);
router.put("/update/:blogId", verifyToken, blog.updateBlog);
router.put("/like/:blogId", verifyToken, blog.likeBlog);
router.put("/unlike/:blogId", verifyToken, blog.unlikeBlog);
router.get("/allblogs", blog.getAllBlogs);
router.get("/:id", blog.getBlogById);

export default router;
