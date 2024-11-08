import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import tokenModel from "../models/token.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

class UserController {
  generateToken = (obj) =>
    jwt.sign({ id: obj._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  storeInCookie = async (res, token) => {
    await res.cookie("token", token, { httpOnly: true, secure: true });
  };

  manageTokenCount = async () => {
    try {
      const count = await tokenModel.countDocuments();
      if (count > 10) {
        const oldestToken = await tokenModel.findOne().sort({ createdAt: 1 });
        if (oldestToken) await tokenModel.deleteOne({ _id: oldestToken._id });
      }
    } catch (err) {
      console.error("Error managing token count:", err);
    }
  };

  getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  registerController = async (req, res) => {
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
      res.status(500).json({ message: "Registration failed", error });
    }
  };

  loginController = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password." });
    }

    try {
      const user = await userModel.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const { password, ...others } = user._doc;
      const token = this.generateToken(others);
      await this.storeInCookie(res, token);
      res.status(200).json({ user: others, token });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  };

  logoutController = async (req, res) => {
    try {
      const token = req.cookies.token;
      await new tokenModel({ token }).save();
      this.manageTokenCount();
      await res.clearCookie("token");
      res
        .status(200)
        .json({ message: "Logout successful, token stored in DB" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  };

  getToken = async (req, res) => {
    try {
      const token = req.cookies.token;
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  currentUser = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "User not logged in" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { password, ...others } = user._doc;
      res.status(200).json(others);
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  updateProfile = async (req, res) => {
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
      res
        .status(500)
        .json({ message: "Failed to update profile", error: error.message });
    }
  };

  sendResetTokenEmail = async (email, resetToken) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("Error sending email:", error);
      else console.log("Email sent: " + info.response);
    });
  };

  initiatePasswordReset = async (req, res) => {
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

      await this.sendResetTokenEmail(email, resetToken);
      res.status(200).json({ message: "Password reset token sent to email" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
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

      if (!user)
        return res
          .status(400)
          .json({ message: "Token is invalid or has expired" });

      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  };
}

export default UserController;
