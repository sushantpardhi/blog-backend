import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import blogController from "../controllers/blogController.js";

const router = express.Router();

const blog = new blogController();

router.post("/publish", verifyToken, blog.publishBlog);
router.delete("/delete", verifyToken, blog.deleteBlog);
router.put("/update", verifyToken, blog.updateBlog);
router.get("/allblogs", blog.getAllBlogs);
router.get("", blog.getBlogById);
router.get("/search", blog.searchBlogs);
router.get("/filter", blog.filterBlog);

export default router;
