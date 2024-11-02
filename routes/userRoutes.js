const verifyToken = require("../middlewares/verifyToken");

const express = require("express");
const UserController = require("../controllers/userController");
const router = express.Router();

const user = new UserController();

router.post("/register", user.registerController);
router.post("/login", user.loginController);
router.post("/logout", user.logoutController);
router.get("/currentUser", verifyToken, user.currentUser);

module.exports = router;
