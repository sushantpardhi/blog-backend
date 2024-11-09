import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import blogController from "../controllers/blogController.js";

const router = express.Router();

const blog = new blogController();

router.get("/search", blog.searchBlog);
router.get("/filter", blog.filterBlog);
router.post("/publish", verifyToken, blog.publishBlog);
router.delete("/delete", verifyToken, blog.deleteBlog);
router.put("/update/:id", verifyToken, blog.updateBlog);
router.post("/addComment/:id", verifyToken, blog.addComment);
router.put("/updateComment/:id", verifyToken, blog.updateComment);
router.get("/allblogs", blog.getAllBlogs);
router.get("/:id", blog.getBlogById);

export default router;
