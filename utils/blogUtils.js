import blogModel from "../models/blogModel.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "./customError.js";

export const findBlogById = async (blogId, next) => {
  if (!blogId) {
    return next(new BadRequestError("Blog ID is required"));
  }

  const blog = await blogModel
    .findById(blogId)
    .populate("author", "-password")
    .populate("comments");

  if (!blog) {
    return next(new NotFoundError("Blog not found"));
  }

  return blog;
};

export const checkIfAuthor = (blog, userId, next) => {
  if (blog.author._id.toString() !== userId) {
    return next(
      new ForbiddenError("Access denied. You are not the author of this post.")
    );
  }
};

export const checkUserAuthentication = (user, next) => {
  if (!user) {
    return next(new UnauthorizedError("Unauthorized. Please log in."));
  }
};

export const validateQueryParam = (param, paramName, next) => {
  if (!param) {
    return next(new BadRequestError(`${paramName} is required`));
  }
};
