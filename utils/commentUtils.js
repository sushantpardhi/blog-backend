import blogModel from "../models/blogModel.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "./customError.js";

export const validateUser = (req, next) => {
  if (!req.user) {
    return next(new UnauthorizedError("Unauthorized. Please log in."));
  }
};

export const validateBlogAndComment = async (req, next) => {
  const blogId = req.params.blogId;
  if (!blogId) {
    return next(new BadRequestError("Blog ID is required"));
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    return next(new NotFoundError("Blog not found"));
  }

  const commentId = req.params.commentId;
  if (commentId) {
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }
    return { blog, comment };
  }

  return { blog };
};

export const validateCommentOwnership = (comment, userId, next) => {
  if (comment.commenter.toString() !== userId) {
    return next(
      new ForbiddenError(
        "Access denied. You are not the author of this comment."
      )
    );
  }
};
