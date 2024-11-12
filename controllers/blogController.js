import blogModel from "../models/blogModel.js";
import mongoose from "mongoose";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/customError.js";

class BlogController {
  // Publish a new blog
  publishBlog = async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Unauthorized. Please log in."));
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

  // Get all blogs with pagination
  getAllBlogs = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const blogs = await blogModel
        .find({})
        .skip(skip)
        .limit(limit)
        .populate("author", "-password")
        .populate("comments.commenter", "-password");

      const totalBlogs = await blogModel.countDocuments({});
      const totalPages = Math.ceil(totalBlogs / limit);

      res.status(200).json({
        blogs,
        pagination: {
          totalBlogs,
          totalPages,
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get a blog by ID
  getBlogById = async (req, res, next) => {
    const blogId = req.params.id;
    try {
      if (!blogId) {
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel
        .findById(blogId)
        .populate("author", "-password")
        .populate("comments.commenter", "-password");

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
      }

      if (blog.author.toString() !== req.user.id) {
        return next(
          new ForbiddenError(
            "Access denied. You are not the author of this post."
          )
        );
      }

      const { likes, author, tags, ...otherUpdates } = req.body;

      if (likes !== undefined) {
        return next(new BadRequestError("Cannot update likes directly"));
      }

      if (author !== undefined) {
        return next(new BadRequestError("Cannot update author directly"));
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
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
      }

      if (blog.author.toString() !== req.user.id.toString()) {
        return next(
          new ForbiddenError("You are not authorized to delete this blog")
        );
      }

      await blogModel.findByIdAndDelete(blogId);

      res.status(200).json({ message: "Blog deleted successfully!" });
    } catch (error) {
      next(error);
    }
  };

  // Search blogs by title, content, or tags
  searchBlog = async (req, res, next) => {
    const query = req.query.q;

    if (!query) {
      return next(new BadRequestError("Search query is required"));
    }

    try {
      const blogs = await blogModel.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ],
      });

      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };

  // Filter blogs by tags
  filterBlogByTags = async (req, res, next) => {
    const tags = req.query.tags;

    if (!tags) {
      return next(new BadRequestError("Tags query is required"));
    }

    try {
      const blogs = await blogModel.find({
        tags: { $in: tags.split(",") },
      });

      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };

  // Filter blogs by author
  filterBlogByAuthor = async (req, res, next) => {
    const author = req.query.author;

    if (!author) {
      return next(new BadRequestError("Author query is required"));
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      return next(new BadRequestError("Invalid author ID"));
    }

    try {
      const blogs = await blogModel.find({
        author: new mongoose.Types.ObjectId(author),
      });

      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };
}

export default BlogController;
