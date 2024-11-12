import jwt from "jsonwebtoken";
import tokenModel from "../models/token.js";
import nodemailer from "nodemailer";
import validator from "validator";
import bcrypt from "bcrypt";

export const generateToken = (obj) =>
  jwt.sign({ id: obj._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const storeInCookie = async (res, token) => {
  await res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
};

export const manageTokenCount = async () => {
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

export const sendResetTokenEmail = async (email, resetToken) => {
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

export const sendPasswordResetConfirmationEmail = async (email) => {
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
    subject: "Password Reset Confirmation",
    text: `Your password has been successfully reset.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending email:", error);
    else console.log("Email sent: " + info.response);
  });
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return "Username must be at least 3 characters long.";
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    return "Invalid email format.";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const sendWelcomeEmail = async (email, username) => {
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
    subject: "Welcome to Our Service",
    text: `Hello ${username},\n\nWelcome to our service! We're glad to have you on board.\n\nBest regards,\nThe Blog Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending email:", error);
    else console.log("Email sent: " + info.response);
  });
};
