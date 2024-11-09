import blogModel from "../models/blogModel.js";

class BlogController {
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
      const savedBlog = await newBlog.save();
      res.status(201).json({ message: "Blog uploaded to db", blog: savedBlog });
    } catch (error) {
      next(error);
    }
  };

  getAllBlogs = async (req, res, next) => {
    try {
      const blogs = await blogModel.find({});
      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  };

  getBlogById = async (req, res, next) => {
    const blogId = req.params.id;

    console.log(blogId);
    try {
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel
        .findById(blogId)
        .populate("author")
        .populate("comments.commenter");

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ blog });
    } catch (error) {
      next(error);
    }
  };

  updateBlog = async (req, res, next) => {
    try {
      const blogId = req.params.id;

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
      next(error);
    }
  };

  deleteBlog = async (req, res, next) => {
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
      next(error);
    }
  };
}

export default BlogController;
