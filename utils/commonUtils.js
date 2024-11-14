import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "./customError.js";

export const generateToken = (obj) =>
  jwt.sign({ id: obj._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const storeInCookie = async (res, token) => {
  await res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    throw new BadRequestError("Username must be at least 3 characters long.");
  }
};

export const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new BadRequestError("Invalid email format.");
  }
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new BadRequestError("Password must be at least 6 characters long.");
  }
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
    throw new BadRequestError("Invalid token.");
  }
};

export const sendJsonResponse = (res, status, message, data = {}) => {
  res.status(status).json({ message, ...data });
};
