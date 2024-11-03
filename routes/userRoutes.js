import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import UserController from "../controllers/userController.js";

const router = express.Router();

const user = new UserController();

router.post("/register", user.registerController);
router.post("/login", user.loginController);
router.post("/logout", user.logoutController);
router.get("/currentUser", verifyToken, user.currentUser);

export default router;
