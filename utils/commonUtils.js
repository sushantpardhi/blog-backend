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

// Group authentication utilities
export const generateToken = (obj) =>
  jwt.sign({ id: obj._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new BadRequestError("Invalid token.");
  }
};

export const storeInCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// Group validation utilities
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

export const sendJsonResponse = (res, status, message, data = {}) => {
  res.status(status).json({ message, ...data });
};

export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return validator.escape(input);
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (typeof input === "object" && input !== null) {
    const sanitizedObject = {};
    for (const key in input) {
      sanitizedObject[key] = sanitizeInput(input[key]);
    }
    return sanitizedObject;
  }
  return input;
};
