import blogModel from "../models/blogModel.js";
import commentModel from "../models/commentModel.js";
import { sendJsonResponse, sanitizeInput } from "../utils/commonUtils.js";
import {
  validateUser,
  validateBlogAndComment,
  validateCommentOwnership,
} from "../utils/commentUtils.js";
import { NotFoundError } from "../utils/customError.js";

class CommentController {
  // Add a new comment
  static addComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

      const sanitizedComment = sanitizeInput(req.body.comment);

      const newComment = await commentModel.create({
        blog: blog._id,
        commenter: req.user.id,
        content: sanitizedComment,
      });

      blog.comments.push(newComment._id);
      await blog.save();

      const populatedBlog = await blog.populate("comments");

      sendJsonResponse(res, 201, "Comment added successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper function to get and validate comment
  static getComment = async (req, next) => {
    const comment = await commentModel.findById(req.params.commentId);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }
    return comment;
  };

  // Helper function to handle like/unlike logic
  static handleLike = async (comment, userId, isLike) => {
    const index = comment.likedBy.indexOf(userId);
    if (isLike && index === -1) {
      comment.likes += 1;
      comment.likedBy.push(userId);
    } else if (!isLike && index !== -1) {
      comment.likes -= 1;
      comment.likedBy.splice(index, 1);
    }
    await comment.save();
  };

  // Update an existing comment
  static updateComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);
      const comment = await CommentController.getComment(req, next);

      validateCommentOwnership(comment, req.user.id, next);

      comment.content = sanitizeInput(req.body.comment);
      await comment.save();

      const populatedBlog = await blog.populate("comments");
      sendJsonResponse(res, 200, "Comment updated successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };

  // Like a comment
  static likeComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);
      const comment = await CommentController.getComment(req, next);

      await CommentController.handleLike(comment, req.user.id, true);

      const populatedBlog = await blog.populate("comments");
      sendJsonResponse(res, 200, "Comment liked successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };

  // Unlike a comment
  static unlikeComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);
      const comment = await CommentController.getComment(req, next);

      await CommentController.handleLike(comment, req.user.id, false);

      const populatedBlog = await blog.populate("comments");
      sendJsonResponse(res, 200, "Comment unliked successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
