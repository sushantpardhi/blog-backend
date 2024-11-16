import userModel from "../models/userModel.js";
import blogModel from "../models/blogModel.js";

// Utility functions
import {
  validateUsername,
  validateEmail,
  sendJsonResponse,
  sanitizeInput,
} from "../utils/commonUtils.js";

// User-related utility functions
import { checkUserExistence, findUserById } from "../utils/userUtils.js";

// Custom error classes
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "../utils/customError.js";

class UserController {
  static getUserId = (req) => req.user.id;

  // Get all users
  static getAllUsers = async (req, res, next) => {
    try {
      const users = await userModel.find();
      sendJsonResponse(res, 200, "All users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  };

  static handleUserUpdate = async (userId, updates, res, message) => {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedUser) throw new NotFoundError("User not found");

    const { password, ...others } = updatedUser._doc;
    sendJsonResponse(res, 200, message, { user: others });
  };

  // Update user details
  static updateUser = async (req, res, next) => {
    const userId = UserController.getUserId(req);
    let { username, email, profilePic } = req.body;

    try {
      const updates = {};

      if (username) {
        username = sanitizeInput(username);
        validateUsername(username);
        await checkUserExistence(username, null);
        updates.username = username;
      }
      if (email) {
        email = sanitizeInput(email);
        validateEmail(email);
        await checkUserExistence(null, email);
        updates.email = email;
      }
      if (profilePic) {
        profilePic = sanitizeInput(profilePic);
        updates.profilePic = profilePic;
      }

      await UserController.handleUserUpdate(
        userId,
        updates,
        res,
        "Profile updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // Upload profile picture
  static uploadProfilePic = async (req, res, next) => {
    if (!req.file || !req.file.path) {
      return next(new BadRequestError("No file uploaded"));
    }

    try {
      const userId = UserController.getUserId(req);
      const profilePicUrl = req.file.path;

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { profilePic: profilePicUrl },
        { new: true }
      );

      if (!updatedUser) {
        return next(new NotFoundError("User not found"));
      }

      const { password, ...others } = updatedUser._doc;
      sendJsonResponse(res, 200, "Profile picture updated successfully", {
        user: others,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete user
  static deleteUser = async (req, res, next) => {
    const userId = UserController.getUserId(req);
    let { username } = req.body;

    try {
      username = sanitizeInput(username);
      const user = await findUserById(userId);
      const currentUsername = user.username;

      if (currentUsername !== username) {
        return next(
          new ForbiddenError("You are not authorized to delete this user")
        );
      }

      await blogModel.deleteMany({ author: userId });

      const deletedUser = await userModel.findByIdAndDelete(userId);
      await res.clearCookie("token");
      if (!deletedUser) {
        return next(new NotFoundError("User not found"));
      }

      sendJsonResponse(res, 200, "User and their blogs deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
