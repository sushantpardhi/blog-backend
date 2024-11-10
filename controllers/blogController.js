import blogModel from "../models/blogModel.js";
import mongoose from "mongoose";

class BlogController {
  // Publish a new blog
  publishBlog = async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }
      const newBlog = new blogModel({
        ...req.body,
        author: req.user.id,
      });
      let savedBlog = await newBlog.save();
      savedBlog = await savedBlog.populate("author", "-password");
      res.status(201).json({ message: "Blog uploaded to db", blog: savedBlog });
    } catch (error) {
      next(error);
    }
  };

  // Get all blogs
  getAllBlogs = async (req, res, next) => {
    try {
      const blogs = await blogModel
        .find({})
        .populate("author", "-password")
        .populate("comments.commenter", "-password");
      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };

  // Get a blog by ID
  getBlogById = async (req, res, next) => {
    const blogId = req.params.id;
    try {
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel
        .findById(blogId)
        .populate("author", "-password")
        .populate("comments.commenter", "-password");

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ blog });
    } catch (error) {
      next(error);
    }
  };

  // Update a blog
  updateBlog = async (req, res, next) => {
    const blogId = req.params.blogId;
    try {
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

      const { likes, author, tags, ...otherUpdates } = req.body;

      if (likes !== undefined) {
        return res
          .status(400)
          .json({ message: "Cannot update likes directly" });
      }

      if (author !== undefined) {
        return res
          .status(400)
          .json({ message: "Cannot update author directly" });
      }

      const updatedBlog = await blogModel
        .findByIdAndUpdate(
          blogId,
          { $set: { ...otherUpdates }, tags },
          { new: true }
        )
        .populate("author", "-password")
        .populate("comments.commenter", "-password");

      res
        .status(200)
        .json({ message: "Blog updated successfully", updatedBlog });
    } catch (error) {
      next(error);
    }
  };

  // Like a blog
  likeBlog = async (req, res, next) => {
    const blogId = req.params.blogId;
    const userId = req.user.id;
    try {
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      await blog.like(userId);

      res
        .status(200)
        .json({ message: "Blog liked successfully", likes: blog.likes });
    } catch (error) {
      next(error);
    }
  };

  // Unlike a blog
  unlikeBlog = async (req, res, next) => {
    const blogId = req.params.blogId;
    const userId = req.user.id;
    try {
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      await blog.unlike(userId);

      res
        .status(200)
        .json({ message: "Blog unliked successfully", likes: blog.likes });
    } catch (error) {
      next(error);
    }
  };

  // Delete a blog
  deleteBlog = async (req, res, next) => {
    const blogId = req.query.id;
    try {
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
      next(error);
    }
  };

  // Search blogs by query
  searchBlog = async (req, res, next) => {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    try {
      const blogs = await blogModel.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      });

      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };

  // Filter blogs by tags or author
  filterBlog = async (req, res, next) => {
    const { tags, author } = req.query;

    if (!tags && !author) {
      return res
        .status(400)
        .json({ message: "Tags or author query is required" });
    }

    try {
      const filterCriteria = {};
      if (tags) {
        filterCriteria.tags = { $in: tags.split(",") };
      }
      if (author) {
        if (!mongoose.Types.ObjectId.isValid(author)) {
          return res.status(400).json({ message: "Invalid author ID" });
        }
        filterCriteria.author = new mongoose.Types.ObjectId(author);
      }

      const blogs = await blogModel.find(filterCriteria);

      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };
}

export default BlogController;
