import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

// Use static methods directly from AuthController
router.post("/register", AuthController.registerController);
router.post("/login", AuthController.loginController);
router.post("/logout", AuthController.logoutController);
router.post("/initiatePasswordReset", AuthController.initiatePasswordReset);
router.post("/resetPassword", AuthController.resetPassword);
router.get("/currentUser", AuthController.currentUser);
router.get("/token", AuthController.getToken);

export default router;
