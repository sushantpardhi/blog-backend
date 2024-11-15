import express from "express";
import UserController from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../utils/upload.js";

const router = express.Router();

const user = new UserController();

router.get("/", user.getAllUsers);
router.put("/updateProfile", verifyToken, user.updateUser);
router.delete("/delete", verifyToken, user.deleteUser);
router.post(
  "/uploadProfilePic",
  verifyToken,
  upload.single("profilePic"),
  user.uploadProfilePic
);

export default router;
