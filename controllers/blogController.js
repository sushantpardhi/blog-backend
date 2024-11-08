import blogModel from "../models/blogModel.js";

class BlogController {
  handleError = (res, error, customMessage = "Internal server error") => {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token. Please login again." });
    }
    res.status(500).json({ message: customMessage, error: error.message });
  };

  publishBlog = async (req, res) => {
    try {
      const newBlog = new blogModel({
        ...req.body,
        author: req.user.id,
      });
      const savedBlog = await newBlog.save();
      res.status(201).json({ message: "Blog uploaded to db", blog: savedBlog });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deleteBlog = async (req, res) => {
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
      this.handleError(res, error, "Failed to delete blog");
    }
  };

  filterBlog = async (req, res) => {
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
      this.handleError(res, error, "An error occurred while filtering blogs");
    }
  };

  getAllBlogs = async (req, res) => {
    try {
      const blogs = await blogModel.find({});
      res.status(200).json({ blogs });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getBlogById = async (req, res) => {
    try {
      const blogId = req.query.id;

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ blog });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  searchBlogs = async (req, res) => {
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
      this.handleError(
        res,
        error,
        "An error occurred while searching for blogs"
      );
    }
  };

  updateBlog = async (req, res) => {
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
      this.handleError(res, error, "Error updating blog");
    }
  };
}

export default BlogController;
