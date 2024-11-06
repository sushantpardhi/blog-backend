import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import tokenSchema from "../models/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

class UserController {
  constructor() {
    this.getAllUsers = this.getAllUsers.bind(this);
    this.registerController = this.registerController.bind(this);
    this.loginController = this.loginController.bind(this);
    this.logoutController = this.logoutController.bind(this);
    this.currentUser = this.currentUser.bind(this);
    this.generateToken = this.generateToken.bind(this);
    // this.storeInCookie = this.storeInCookie.bind(this);
    this.manageTokenCount = this.manageTokenCount.bind(this);
  }

  generateToken(obj) {
    return jwt.sign({ id: obj._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  // async storeInCookie(res, token) {
  //   await res.cookie("token", token, {
  //     httpOnly: true,
  //     secure: true,
  //   });
  // }

  async manageTokenCount() {
    try {
      const count = await tokenSchema.countDocuments();

      if (count > 10) {
        const oldestToken = await tokenSchema.findOne().sort({ createdAt: 1 });
        if (oldestToken) {
          await tokenSchema.deleteOne({ _id: oldestToken._id });
          // console.log(`Removed oldest token: ${oldestToken.token}`);
        }
      }
    } catch (err) {
      console.error("Error managing token count:", err);
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userModel.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  }

  async registerController(req, res) {
    try {
      const newUser = new userModel(req.body);
      await newUser.save();
      const { password: pwd, ...others } = newUser._doc;
      res
        .status(201)
        .json({ message: "User registered successfully!", user: others });
    } catch (error) {
      res.status(500).json({ message: "Registration failed", error });
    }
  }

  async loginController(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password." });
    }

    try {
      const user = await userModel.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const { password: pwd, ...others } = user._doc;
      const token = this.generateToken(others);

      return res.status(200).json({ user: others, token: token });
    } catch (error) {
      return res.status(500).json({ message: "Login failed", error });
    }
  }

  async logoutController(req, res) {
    const token = req.cookies.token;

    try {
      const newToken = new tokenSchema({ token });
      await newToken.save();

      this.manageTokenCount();

      // await res.clearCookie("token");
      return res
        .status(200)
        .json({ message: "Logout successful, token stored in DB" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }

  async currentUser(req, res) {
    try {
      const id = req.params.id;
      console.log("Received user ID:", id); // Add this line to log the received ID

      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid user ID format:", id); // Add this line to log invalid ID format
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: pwd, ...others } = user._doc;

      res.status(200).json(others);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

export default UserController;