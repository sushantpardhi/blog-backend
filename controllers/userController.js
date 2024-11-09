import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import tokenModel from "../models/token.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  generateToken,
  storeInCookie,
  manageTokenCount,
  sendResetTokenEmail,
} from "../utils/userUtils.js";

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
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      const newUser = new userModel(req.body);
      await newUser.save();
      const { password, ...others } = newUser._doc;
      res
        .status(201)
        .json({ message: "User registered successfully!", user: others });
    } catch (error) {
      next(error);
    }
  };

  loginController = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password." });
    }

    try {
      const user = await userModel.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: "Invalid credentials" });
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
      const token = req.cookies.token;
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  };

  currentUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "User not logged in" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { password, ...others } = user._doc;
      res.status(200).json(others);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    const userId = req.user.id;
    const { username, email, profilePic } = req.body;
    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required." });
    }

    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { username, email, profilePic },
        { new: true, runValidators: true }
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });

      const { password, ...others } = updatedUser._doc;
      res
        .status(200)
        .json({ message: "Profile updated successfully", user: others });
    } catch (error) {
      next(error);
    }
  };

  initiatePasswordReset = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    try {
      const user = await userModel.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

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
    if (!token || !newPassword) {
      console.log("Token or new password not provided");
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }

    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      console.log("Hashed token:", hashedToken);

      const user = await userModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        console.log("User not found or token expired");
        return res
          .status(400)
          .json({ message: "Token is invalid or has expired" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("Hashed new password:", hashedPassword);

      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.isPasswordReset = true;
      await user.save();
      user.isPasswordReset = undefined;

      console.log("Password reset successful for user:", user._id);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
