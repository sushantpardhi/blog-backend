import express from "express";
import UserController from "../controllers/userController.js";

const router = express.Router();

const user = new UserController();

router.post("/register", user.registerController);
router.post("/login", user.loginController);
router.post("/logout", user.logoutController);
router.get("/:id", user.currentUser);
router.get("/", user.getAllUsers);

export default router;
