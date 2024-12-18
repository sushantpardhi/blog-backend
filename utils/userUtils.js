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
import { manageTokenCount } from "./tokenUtils.js";

export const checkUserExistence = async (username, email) => {
  const query = {};
  if (username) query.username = username;
  if (email) query.email = email;

  const userExists = await userModel.findOne(query);

  if (userExists) {
    if (userExists.username === username) {
      throw new ConflictError("Username is already taken");
    }
    if (userExists.email === email) {
      throw new ConflictError("Email is already registered with another account");
    }
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
