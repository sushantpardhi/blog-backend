import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

const authController = new AuthController();

router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.post("/logout", authController.logoutController);
router.post("/initiatePasswordReset", authController.initiatePasswordReset);
router.post("/resetPassword", authController.resetPassword);
router.get("/currentUser", authController.currentUser);
router.get("/token", authController.getToken);

export default router;
