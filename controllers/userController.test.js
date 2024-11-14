import { describe, it, expect, vi } from "vitest";
import UserController from "./userController";
import userModel from "../models/userModel";
import tokenModel from "../models/token";
import {
  sendJsonResponse,
  validateUsername,
  validateEmail,
  validatePassword,
  comparePasswords,
  verifyToken,
  hashPassword,
  storeInCookie,
} from "../utils/commonUtils";
import {
  manageTokenCount,
  checkUserExistence,
  findUserById,
  findUserByUsername,
  findUserByEmail,
  checkCookiesAndToken,
} from "../utils/userUtils";
import {
  sendResetTokenEmail,
  sendPasswordResetConfirmationEmail,
  sendWelcomeEmail,
} from "../utils/emailUtils";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "../utils/customError";

vi.mock("../models/userModel");
vi.mock("../models/token");
vi.mock("../utils/commonUtils");
vi.mock("../utils/userUtils");
vi.mock("../utils/emailUtils");
vi.mock("../utils/customError");

describe("UserController", () => {
  const userController = new UserController();

  describe("getAllUsers", () => {
    it("should retrieve all users successfully", async () => {
      const req = {};
      const res = { json: vi.fn() };
      const next = vi.fn();
      userModel.find.mockResolvedValue([{ username: "testuser" }]);

      await userController.getAllUsers(req, res, next);

      expect(userModel.find).toHaveBeenCalled();
      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        200,
        "All users retrieved successfully",
        [{ username: "testuser" }]
      );
    });

    it("should handle errors", async () => {
      const req = {};
      const res = {};
      const next = vi.fn();
      const error = new Error("Test error");
      userModel.find.mockRejectedValue(error);

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("registerController", () => {
    it("should register a new user successfully", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = { json: vi.fn() };
      const next = vi.fn();
      userModel.mockImplementation(() => ({
        save: vi
          .fn()
          .mockResolvedValue({
            _doc: { username: "testuser", email: "test@example.com" },
          }),
      }));
      //   sendWelcomeEmail.mockResolvedValue();

      await userController.registerController(req, res, next);

      expect(validateUsername).toHaveBeenCalledWith("testuser");
      expect(validateEmail).toHaveBeenCalledWith("test@example.com");
      expect(validatePassword).toHaveBeenCalledWith("password123");
      expect(checkUserExistence).toHaveBeenCalledWith(
        "testuser",
        "test@example.com"
      );
    //   expect(sendWelcomeEmail).toHaveBeenCalledWith(
    //     "test@example.com",
    //     "testuser"
    //   );
      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        201,
        "User registered successfully!",
        { user: { username: "testuser", email: "test@example.com" } }
      );
    });

    it("should handle errors", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = {};
      const next = vi.fn();
      const error = new Error("Test error");
      userModel.mockImplementation(() => ({
        save: vi.fn().mockRejectedValue(error),
      }));

      await userController.registerController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
