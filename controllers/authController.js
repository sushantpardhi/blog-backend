import crypto from "crypto";
import userModel from "../models/userModel.js";
import tokenModel from "../models/token.js";

// Utility functions
import {
  generateToken,
  storeInCookie,
  validateUsername,
  validateEmail,
  validatePassword,
  comparePasswords,
  verifyToken,
  hashPassword,
  sendJsonResponse,
} from "../utils/commonUtils.js";

// User-related utility functions
import {
  manageTokenCount,
  findUserByUsername,
  findUserByEmail,
  checkCookiesAndToken,
  checkUserExistence,
  findUserById,
} from "../utils/userUtils.js";

// Email utility functions
import {
  sendResetTokenEmail,
  sendPasswordResetConfirmationEmail,
  sendWelcomeEmail,
} from "../utils/emailUtils.js";

// Custom error classes
import { BadRequestError, UnauthorizedError } from "../utils/customError.js";

class AuthController {
  // Register a new user
  registerController = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
      validateUsername(username);
      validateEmail(email);
      validatePassword(password);

      await checkUserExistence(username, email);

      const newUser = new userModel(req.body);
      await newUser.save();
      const { password: userPassword, ...others } = newUser._doc;
      await sendWelcomeEmail(email, username);
      sendJsonResponse(res, 201, "User registered successfully!", {
        user: others,
      });
    } catch (error) {
      next(error);
    }
  };

  // User login
  loginController = async (req, res, next) => {
    const { username, password } = req.body;

    try {
      validateUsername(username);
      validatePassword(password);

      const user = await findUserByUsername(username);
      if (!(await comparePasswords(password, user.password))) {
        return next(new UnauthorizedError("Invalid credentials"));
      }

      const { password: userPassword, ...others } = user._doc;
      const token = generateToken(others);
      await storeInCookie(res, token);
      sendJsonResponse(res, 200, "Login successful", { user: others, token });
    } catch (error) {
      next(error);
    }
  };

  // User logout
  logoutController = async (req, res, next) => {
    try {
      const token = checkCookiesAndToken(req);
      await new tokenModel({ token }).save();
      manageTokenCount();
      await res.clearCookie("token");
      sendJsonResponse(res, 200, "Logout successful, token stored in DB");
    } catch (error) {
      next(error);
    }
  };

  // Get token from cookies
  getToken = async (req, res, next) => {
    try {
      const token = checkCookiesAndToken(req);
      sendJsonResponse(res, 200, "Token retrieved successfully", { token });
    } catch (error) {
      next(error);
    }
  };

  // Get current user details
  currentUser = async (req, res, next) => {
    try {
      const token = checkCookiesAndToken(req);
      const decoded = verifyToken(token);

      const user = await findUserById(decoded.id);
      const { password, ...others } = user._doc;
      sendJsonResponse(res, 200, "Current user retrieved successfully", others);
    } catch (error) {
      next(error);
    }
  };

  // Initiate password reset
  initiatePasswordReset = async (req, res, next) => {
    const { email } = req.body;

    try {
      validateEmail(email);

      const user = await findUserByEmail(email);

      const resetToken = crypto.randomBytes(3).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 3600000;
      await user.save();

      await sendResetTokenEmail(email, resetToken);
      sendJsonResponse(res, 200, "Password reset token sent to email");
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;

    try {
      if (!token) {
        throw new BadRequestError("Token is required.");
      }
      validatePassword(newPassword);

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

      sendJsonResponse(res, 200, "Password reset successful");
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
