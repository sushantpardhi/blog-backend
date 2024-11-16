import express from "express";
import UserController from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Use static methods directly from UserController
router.get("/", UserController.getAllUsers);
router.put("/updateProfile", verifyToken, UserController.updateUser);
router.delete("/delete", verifyToken, UserController.deleteUser);
router.post(
  "/uploadProfilePic",
  verifyToken,
  upload.single("profilePic"),
  UserController.uploadProfilePic
);

export default router;
