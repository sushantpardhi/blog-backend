import userModel from "../models/userModel.js";
import blogModel from "../models/blogModel.js";
import tokenModel from "../models/token.js";
import crypto from "crypto";
import {
  generateToken,
  storeInCookie,
  manageTokenCount,
  sendResetTokenEmail,
  validateUsername,
  validateEmail,
  validatePassword,
  comparePasswords,
  verifyToken,
  sendWelcomeEmail,
  hashPassword,
  sendPasswordResetConfirmationEmail,
} from "../utils/userUtils.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "../utils/customError.js";

class UserController {
  getAllUsers = async (req, res, next) => {
    try {
      const users = await userModel.find();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  registerController = async (req, res, next) => {
    const { username, email, password } = req.body;
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (usernameError || emailError || passwordError) {
      return next(
        new BadRequestError(usernameError || emailError || passwordError)
      );
    }

    try {
      const usernameExists = await userModel.findOne({
        username,
      });
      if (usernameExists) {
        return next(new ConflictError("Username is already taken"));
      }
      const emailExists = await userModel.findOne({
        email,
      });
      if (emailExists) {
        return next(
          new ConflictError("Email is already registered with another account")
        );
      }

      const newUser = new userModel(req.body);
      await newUser.save();
      const { password: userPassword, ...others } = newUser._doc;
      await sendWelcomeEmail(email, username);
      res
        .status(201)
        .json({ message: "User registered successfully!", user: others });
    } catch (error) {
      next(error);
    }
  };

  loginController = async (req, res, next) => {
    const { username, password } = req.body;
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      return next(new BadRequestError(usernameError || passwordError));
    }

    try {
      const user = await userModel.findOne({ username });
      if (!user || !(await comparePasswords(password, user.password))) {
        return next(new UnauthorizedError("Invalid credentials"));
      }

      const { password: userPassword, ...others } = user._doc;
      const token = generateToken(others);
      await storeInCookie(res, token);
      res.status(200).json({ user: others, token });
    } catch (error) {
      next(error);
    }
  };

  logoutController = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return next(new BadRequestError("No token found in cookies."));
      }
      await new tokenModel({ token }).save();
      manageTokenCount();
      await res.clearCookie("token");
      res
        .status(200)
        .json({ message: "Logout successful, token stored in DB" });
    } catch (error) {
      next(error);
    }
  };

  getToken = async (req, res, next) => {
    try {
      if (!req.cookies) {
        return next(new BadRequestError("No cookies found."));
      }
      const token = req.cookies.token;
      if (!token) {
        return next(new BadRequestError("No token found in cookies."));
      }
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  };

  currentUser = async (req, res, next) => {
    if (!req.cookies) {
      return next(new BadRequestError("No cookies found."));
    }
    const token = req.cookies.token;
    if (!token) return next(new UnauthorizedError("User not logged in"));

    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new BadRequestError("Invalid token."));
      }

      const user = await userModel.findById(decoded.id);
      if (!user) return next(new NotFoundError("User not found"));

      const { password, ...others } = user._doc;
      res.status(200).json(others);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    const userId = req.user.id;
    const { username, email, profilePic } = req.body;

    const updates = {};
    if (username) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        return next(new BadRequestError(usernameError));
      }
      const usernameExists = await userModel.findOne({ username });
      if (usernameExists) {
        return next(new ConflictError("Username already taken"));
      }
      updates.username = username;
    }
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return next(new BadRequestError(emailError));
      }
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return next(new ConflictError("Email already taken"));
      }
      updates.email = email;
    }
    if (profilePic) {
      updates.profilePic = profilePic;
    }

    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updatedUser) return next(new NotFoundError("User not found"));

      const { password, ...others } = updatedUser._doc;
      res
        .status(200)
        .json({ message: "Profile updated successfully", user: others });
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePic = async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError("User not logged in"));
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
      res.status(200).json({
        message: "Profile picture updated successfully",
        user: others,
      });
    } catch (error) {
      next(error);
    }
  };

  initiatePasswordReset = async (req, res, next) => {
    const { email } = req.body;
    const emailError = validateEmail(email);

    if (emailError) {
      return next(new BadRequestError(emailError));
    }

    try {
      const user = await userModel.findOne({ email });
      if (!user) return next(new NotFoundError("User not found"));

      const resetToken = crypto.randomBytes(3).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 3600000;
      await user.save();

      await sendResetTokenEmail(email, resetToken);
      res.status(200).json({ message: "Password reset token sent to email" });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
    const passwordError = validatePassword(newPassword);

    if (!token || passwordError) {
      return next(new BadRequestError("Token and new password are required."));
    }

    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await userModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return next(new BadRequestError("Token is invalid or has expired"));
      }

      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.isPasswordReset = true;
      await user.save();
      user.isPasswordReset = undefined;

      await sendPasswordResetConfirmationEmail(user.email);

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    const currentUsername = user.username;

    //User input asking for username as a confirmation
    const { username } = req.body;

    if (currentUsername !== username) {
      return next(
        new ForbiddenError("You are not authorized to delete this user")
      );
    }

    try {
      await blogModel.deleteMany({ author: userId });

      const user = await userModel.findByIdAndDelete(userId);
      await res.clearCookie("token");
      if (!user) {
        return next(new NotFoundError("User not found"));
      }

      res
        .status(200)
        .json({ message: "User and their blogs deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
