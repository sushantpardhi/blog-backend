import blogModel from "../models/blogModel.js";
import jwt from "jsonwebtoken";

class blogController {
  constructor() {
    this.publishBlog = this.publishBlog.bind(this);
    this.deleteBlog = this.deleteBlog.bind(this);
    this.filterBlog = this.filterBlog.bind(this);
    this.getAllBlogs = this.getAllBlogs.bind(this);
    this.getBlogById = this.getBlogById.bind(this);
    this.searchBlogs = this.searchBlogs.bind(this);
    this.updateBlog = this.updateBlog.bind(this);
  }

  async publishBlog(req, res) {
    try {
      // const token = req.cookies.token;
      // if (!token) {
      //   return res
      //     .status(401)
      //     .json({ message: "Please login to publish a blog" });
      // }
      // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      // const userId = decodedToken.id;
      const newBlog = new blogModel({
        ...req.body,
        // author: userId,
      });
      const savedBlog = await newBlog.save();
      res.status(201).json({ message: "Blog uploaded to db", blog: savedBlog });
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res
          .status(401)
          .json({ message: "Invalid or expired token. Please login again." });
      }
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  async deleteBlog(req, res) {
    try {
      const blogId = req.query.id;

      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      if (blog.author.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this blog" });
      }

      await blogModel.findByIdAndDelete(blogId);

      res.status(200).json({ message: "Blog deleted successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete blog", error: error.message });
    }
  }

  async filterBlog(req, res) {
    try {
      const { author, tags } = req.query;

      let filter = {};

      if (author && tags) {
        filter = { author, tags: { $in: tags.split(",") } };
      } else if (author) {
        filter.author = author;
      } else if (tags) {
        filter.tags = { $in: tags.split(",") };
      }

      const blogs = await blogModel.find(filter);

      res.status(200).json(blogs);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while filtering blogs" });
    }
  }

  async getAllBlogs(req, res) {
    try {
      const blogs = await blogModel.find({});
      res.status(200).json({ blogs });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error });
    }
  }

  async getBlogById(req, res) {
    try {
      const blogId = req.query.id;

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ blog });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error });
    }
  }

  async searchBlogs(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const blogs = await blogModel.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
        ],
      });

      res.status(200).json({ message: "Blogs found", blogs });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while searching for blogs" });
    }
  }

  async updateBlog(req, res) {
    try {
      const blogId = req.query.id;

      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({
          message: "Access denied. You are not the author of this post.",
        });
      }

      const { tags, ...otherUpdates } = req.body;

      // Update the blog including the tags explicitly
      const updatedBlog = await blogModel.findByIdAndUpdate(
        blogId,
        {
          $set: { ...otherUpdates, tags: tags },
        },
        { new: true }
      );

      res
        .status(200)
        .json({ message: "Blog updated successfully", updatedBlog });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error updating blog", error: error.message });
    }
  }
}

export default blogController;
