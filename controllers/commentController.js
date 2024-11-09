import blogModel from "../models/blogModel.js";

class CommentController {
  // Add a comment to a blog
  addComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }

      const blogId = req.params.id;
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const newComment = {
        commenter: req.user.id,
        content: req.body.comment,
      };

      blog.comments.push(newComment);
      await blog.save();

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );

      res
        .status(201)
        .json({ message: "Comment added successfully", blog: populatedBlog });
    } catch (error) {
      next(error);
    }
  };

  // Update a comment
  updateComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }

      const blogId = req.params.id;
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const commentId = req.query.commentId;
      if (!commentId) {
        return res.status(400).json({ message: "Comment ID is required" });
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const comment = blog.comments.id(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.commenter.toString() !== req.user.id) {
        return res.status(403).json({
          message: "Access denied. You are not the author of this comment.",
        });
      }

      comment.content = req.body.comment;
      await blog.save();

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );

      res
        .status(200)
        .json({ message: "Comment updated successfully", blog: populatedBlog });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
