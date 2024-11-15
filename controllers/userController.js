import userModel from "../models/userModel.js";
import blogModel from "../models/blogModel.js";

// Utility functions
import {
  validateUsername,
  validateEmail,
  sendJsonResponse,
} from "../utils/commonUtils.js";

// User-related utility functions
import { checkUserExistence, findUserById } from "../utils/userUtils.js";

// Custom error classes
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/customError.js";

class UserController {
  // Get all users
  getAllUsers = async (req, res, next) => {
    try {
      const users = await userModel.find();
      sendJsonResponse(res, 200, "All users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  };

  // Update user details
  updateUser = async (req, res, next) => {
    const userId = req.user.id;
    const { username, email, profilePic } = req.body;

    try {
      const updates = {};

      if (username) {
        validateUsername(username);
        await checkUserExistence(username, null);
        updates.username = username;
      }
      if (email) {
        validateEmail(email);
        await checkUserExistence(null, email);
        updates.email = email;
      }
      if (profilePic) {
        updates.profilePic = profilePic;
      }

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updatedUser) return next(new NotFoundError("User not found"));

      const { password, ...others } = updatedUser._doc;
      sendJsonResponse(res, 200, "Profile updated successfully", {
        user: others,
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload profile picture
  uploadProfilePic = async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError("User not logged in"));
    }

    if (!req.file || !req.file.path) {
      return next(new Error("No file uploaded"));
    }

    try {
      const userId = req.user.id;
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
  deleteUser = async (req, res, next) => {
    const userId = req.user.id;

    try {
      const user = await findUserById(userId);
      const currentUsername = user.username;

      // User input asking for username as a confirmation
      const { username } = req.body;

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
