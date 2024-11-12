import blogModel from "../models/blogModel.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/customError.js";

class CommentController {
  addComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Unauthorized. Please log in."));
      }

      const blogId = req.params.blogId;
      if (!blogId) {
        return next(new BadRequestError("Blog ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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

  updateComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Unauthorized. Please log in."));
      }

      const blogId = req.params.blogId;
      if (!blogId) {
        return next(new BadRequestError("Blog ID is required"));
      }

      const commentId = req.params.commentId;
      if (!commentId) {
        return next(new BadRequestError("Comment ID is required"));
      }

      const blog = await blogModel.findById(blogId);

      if (!blog) {
        return next(new NotFoundError("Blog not found"));
      }

      const comment = blog.comments.id(commentId);

      if (!comment) {
        return next(new NotFoundError("Comment not found"));
      }

      if (comment.commenter.toString() !== req.user.id) {
        return next(
          new ForbiddenError(
            "Access denied. You are not the author of this comment."
          )
        );
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
        return next(new UnauthorizedError("Unauthorized. Please log in."));
      }

      const blogId = req.params.blogId;
      const commentId = req.params.commentId;

      if (!blogId || !commentId) {
        return next(new BadRequestError("Blog ID and Comment ID are required"));
      }

      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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
        return next(new UnauthorizedError("Unauthorized. Please log in."));
      }

      const blogId = req.params.blogId;
      const commentId = req.params.commentId;

      if (!blogId || !commentId) {
        return next(new BadRequestError("Blog ID and Comment ID are required"));
      }

      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return next(new NotFoundError("Blog not found"));
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

  replyToComment = async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Unauthorized. Please log in."));
      }

      const { blogId, parentId } = req.params;
      if (!blogId || !parentId) {
        return next(
          new BadRequestError("Blog ID and Parent Comment ID are required")
        );
      }

      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return next(new NotFoundError("Blog not found"));
      }

      const reply = {
        commenter: req.user.id,
        content: req.body.comment,
      };

      await blog.replyToComment(parentId, reply);

      const populatedBlog = await blog.populate(
        "comments.commenter comments.replies.commenter",
        "-password"
      );

      res
        .status(201)
        .json({ message: "Reply added successfully", blog: populatedBlog });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
