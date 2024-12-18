import blogModel from "../models/blogModel.js";
import mongoose from "mongoose";
import { sendJsonResponse, sanitizeInput } from "../utils/commonUtils.js";
import {
  findBlogById,
  checkIfAuthor,
  checkUserAuthentication,
  validateQueryParam,
} from "../utils/blogUtils.js";

class BlogController {
  // Publish a new blog
  static publishBlog = async (req, res, next) => {
    try {
      checkUserAuthentication(req.user, next);

      const sanitizedBody = sanitizeInput(req.body);

      const newBlog = new blogModel({
        ...sanitizedBody,
        author: req.user.id,
      });
      let savedBlog = await newBlog.save();
      savedBlog = await savedBlog.populate(BlogController.populateOptions);
      sendJsonResponse(res, 201, "Blog uploaded to db", { blog: savedBlog });
    } catch (error) {
      next(error);
    }
  };

  // Get all blogs with pagination
  static getAllBlogs = async (req, res, next) => {
    const page = parseInt(sanitizeInput(req.query.page)) || 1;
    const limit = parseInt(sanitizeInput(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    try {
      const blogs = await blogModel
        .find({})
        .skip(skip)
        .limit(limit)
        .populate(BlogController.populateOptions);

      const totalBlogs = await blogModel.countDocuments({});
      const totalPages = Math.ceil(totalBlogs / limit);

      sendJsonResponse(res, 200, "All blogs retrieved successfully", {
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
  static getBlogById = async (req, res, next) => {
    try {
      const blogId = sanitizeInput(req.params.id);
      const blog = await findBlogById(blogId, next);
      if (blog) {
        await blog.populate(BlogController.populateOptions);
        sendJsonResponse(res, 200, "Blog retrieved successfully", { blog });
      }
    } catch (error) {
      next(error);
    }
  };

  static updateBlog = async (req, res, next) => {
    try {
      const blogId = sanitizeInput(req.params.blogId);
      const blog = await findBlogById(blogId, next);
      if (blog) {
        checkIfAuthor(blog, req.user.id, next);

        const sanitizedBody = sanitizeInput(req.body);
        const { likes, author, tags, ...otherUpdates } = sanitizedBody;

        if (likes !== undefined) {
          return next(new BadRequestError("Cannot update likes directly"));
        }

        if (author !== undefined) {
          return next(new BadRequestError("Cannot update author directly"));
        }

        const updatedBlog = await blogModel
          .findByIdAndUpdate(
            req.params.blogId,
            { $set: { ...otherUpdates }, tags },
            { new: true }
          )
          .populate(BlogController.populateOptions);

        sendJsonResponse(res, 200, "Blog updated successfully", {
          updatedBlog,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Like a blog
  static likeBlog = async (req, res, next) => {
    try {
      const blog = await findBlogById(req.params.blogId, next);
      if (blog) {
        await blog.like(req.user.id);
        await blog.populate(BlogController.populateOptions);
        sendJsonResponse(res, 200, "Blog liked successfully", {
          likes: blog.likes,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Unlike a blog
  static unlikeBlog = async (req, res, next) => {
    try {
      const blog = await findBlogById(req.params.blogId, next);
      if (blog) {
        await blog.unlike(req.user.id);
        await blog.populate(BlogController.populateOptions);
        sendJsonResponse(res, 200, "Blog unliked successfully", {
          likes: blog.likes,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Delete a blog
  static deleteBlog = async (req, res, next) => {
    try {
      const blog = await findBlogById(req.query.id, next);
      if (blog) {
        checkIfAuthor(blog, req.user.id, next);
        await blogModel.findByIdAndDelete(req.query.id);
        sendJsonResponse(res, 200, "Blog deleted successfully!");
      }
    } catch (error) {
      next(error);
    }
  };

  // Search blogs by title, content, or tags
  static searchBlog = async (req, res, next) => {
    try {
      validateQueryParam(req.query.q, "Search query", next);

      const blogs = await blogModel
        .find({
          $or: [
            { title: { $regex: req.query.q, $options: "i" } },
            { content: { $regex: req.query.q, $options: "i" } },
          ],
        })
        .populate(BlogController.populateOptions);

      sendJsonResponse(res, 200, "Blogs retrieved successfully", { blogs });
    } catch (error) {
      next(error);
    }
  };

  // Filter blogs by tags
  static filterBlogByTags = async (req, res, next) => {
    try {
      validateQueryParam(req.query.tags, "Tags query", next);

      const blogs = await blogModel
        .find({
          tags: { $in: req.query.tags.split(",") },
        })
        .populate(BlogController.populateOptions);

      sendJsonResponse(res, 200, "Blogs filtered by tags successfully", {
        blogs,
      });
    } catch (error) {
      next(error);
    }
  };

  // Filter blogs by author
  static filterBlogByAuthor = async (req, res, next) => {
    try {
      validateQueryParam(req.query.author, "Author query", next);

      if (!mongoose.Types.ObjectId.isValid(req.query.author)) {
        return next(new BadRequestError("Invalid author ID"));
      }

      const blogs = await blogModel
        .find({
          author: new mongoose.Types.ObjectId(req.query.author),
        })
        .populate(BlogController.populateOptions);

      sendJsonResponse(res, 200, "Blogs filtered by author successfully", {
        blogs,
      });
    } catch (error) {
      next(error);
    }
  };

  // Consolidate populate options
  static populateOptions = [
    {
      path: "author",
      select: "-password",
    },
    {
      path: "comments",
      populate: {
        path: "commenter",
        select: "-password",
      },
    },
  ];
}

export default BlogController;
