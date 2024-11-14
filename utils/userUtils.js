import tokenModel from "../models/token.js";
import userModel from "../models/userModel.js";
import {
  sendResetTokenEmail,
  sendPasswordResetConfirmationEmail,
  sendWelcomeEmail,
} from "./emailUtils.js";
import {
  generateToken,
  storeInCookie,
  validateUsername,
  validateEmail,
  validatePassword,
  hashPassword,
  comparePasswords,
  verifyToken,
  sendJsonResponse,
} from "./commonUtils.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customError.js";

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

export const checkUserExistence = async (username, email) => {
  const usernameExists = await userModel.findOne({ username });
  if (usernameExists) {
    throw new ConflictError("Username is already taken");
  }
  const emailExists = await userModel.findOne({ email });
  if (emailExists) {
    throw new ConflictError("Email is already registered with another account");
  }
};

export const findUserById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

export const findUserByUsername = async (username) => {
  const user = await userModel.findOne({ username });
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

export const checkCookiesAndToken = (req) => {
  if (!req.cookies) {
    throw new BadRequestError("No cookies found.");
  }
  const token = req.cookies.token;
  if (!token) {
    throw new BadRequestError("No token found in cookies.");
  }
  return token;
};

export const deleteUserById = async (id) => {
  const user = await userModel.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};
