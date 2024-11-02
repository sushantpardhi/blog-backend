const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const blogController = require("../controllers/blogController");

const router = express.Router();

const blog = new blogController();

router.post("/publish", verifyToken, blog.publishBlog);
router.delete("/delete", verifyToken, blog.deleteBlog);
router.put("/update", verifyToken, blog.updateBlog);
router.get("/allblogs", blog.getAllBlogs);
router.get("", blog.getBlogById);
router.get("/search", blog.searchBlogs);
router.get("/filter", blog.filterBlog);

module.exports = router;
