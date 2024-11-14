import blogModel from "../models/blogModel.js";
import { sendJsonResponse } from "../utils/commonUtils.js";

// Comment-related utility functions
import {
  validateUser,
  validateBlogAndComment,
  validateCommentOwnership,
} from "../utils/commentUtils.js";

class CommentController {
  // Add a new comment
  addComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

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

      const { blog, comment } = await validateBlogAndComment(req, next);

      validateCommentOwnership(comment, req.user.id, next);

      comment.content = req.body.comment;
      await blog.save();

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );

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

      await blog.likeComment(req.params.commentId, req.user.id);

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );
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

      await blog.unlikeComment(req.params.commentId, req.user.id);

      const populatedBlog = await blog.populate(
        "comments.commenter",
        "-password"
      );
      sendJsonResponse(res, 200, "Comment unliked successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };

  // Reply to a comment
  replyToComment = async (req, res, next) => {
    try {
      validateUser(req, next);

      const { blog } = await validateBlogAndComment(req, next);

      const reply = {
        commenter: req.user.id,
        content: req.body.comment,
      };

      await blog.replyToComment(req.params.parentId, reply);

      const populatedBlog = await blog.populate(
        "comments.commenter comments.replies.commenter",
        "-password"
      );

      sendJsonResponse(res, 201, "Reply added successfully", {
        blog: populatedBlog,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
