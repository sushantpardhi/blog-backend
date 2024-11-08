import express from "express";
import UserController from "../controllers/userController.js";

const router = express.Router();

const user = new UserController();

router.post("/register", user.registerController);
router.post("/login", user.loginController);
router.post("/logout", user.logoutController);
router.get("/currentUser", user.currentUser);
router.get("/", user.getAllUsers);
router.get("/token", user.getToken);

export default router;
