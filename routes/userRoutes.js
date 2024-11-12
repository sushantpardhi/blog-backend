import express from "express";
import UserController from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

const user = new UserController();

router.post("/register", user.registerController);
router.post("/login", user.loginController);
router.post("/logout", user.logoutController);
router.get("/currentUser", user.currentUser);
router.get("/", user.getAllUsers);
router.get("/token", user.getToken);
router.put("/updateProfile", verifyToken, user.updateUser);
router.post("/initiatePasswordReset", user.initiatePasswordReset);
router.post("/resetPassword", user.resetPassword);
router.delete("/delete", verifyToken, user.deleteUser);

export default router;
