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

      const blogId = req.params.blogId;
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

      const blogId = req.params.blogId;
      if (!blogId) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const commentId = req.params.commentId; // Fix typo here
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

  likeComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }

      const blogId = req.params.blogId;
      const commentId = req.params.commentId;

      if (!blogId || !commentId) {
        return res
          .status(400)
          .json({ message: "Blog ID and Comment ID are required" });
      }

      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      await blog.likeComment(commentId, req.user.id);

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );
      res
        .status(200)
        .json({ message: "Comment liked successfully", blog: populatedBlog });
    } catch (error) {
      next(error);
    }
  };

  unlikeComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }

      const blogId = req.params.blogId;
      const commentId = req.params.commentId;

      if (!blogId || !commentId) {
        return res
          .status(400)
          .json({ message: "Blog ID and Comment ID are required" });
      }

      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      await blog.unlikeComment(commentId, req.user.id);

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );
      res
        .status(200)
        .json({ message: "Comment unliked successfully", blog: populatedBlog });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
