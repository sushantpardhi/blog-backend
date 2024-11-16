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
  addComment = async (req, res, next) => {
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

  // Update an existing comment
  updateComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

      const comment = await commentModel.findById(req.params.commentId);
      if (!comment) {
        return next(new NotFoundError("Comment not found"));
      }

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
  likeComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

      const comment = await commentModel.findById(req.params.commentId);
      if (comment && !comment.likedBy.includes(req.user.id)) {
        comment.likes += 1;
        comment.likedBy.push(req.user.id);
        await comment.save();
      }

      const populatedBlog = await blog.populate("comments");
      sendJsonResponse(res, 200, "Comment liked successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };

  // Unlike a comment
  unlikeComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

      const comment = await commentModel.findById(req.params.commentId);
      if (comment) {
        const index = comment.likedBy.indexOf(req.user.id);
        if (index !== -1) {
          comment.likes -= 1;
          comment.likedBy.splice(index, 1);
          await comment.save();
        }
      }

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
