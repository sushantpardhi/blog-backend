import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimiter from "./middlewares/rateLimiter.js";
import morgan from "morgan"; // Add morgan import
import { stream } from "./config/logger.js"; // Add logger import

import serverConnection from "./utils/server.js";
import errorHandler from "./utils/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(rateLimiter);

// Add morgan middleware for HTTP request logging
app.use(morgan("combined", { stream }));

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/auth", authRoutes);

// Error Handling
app.use(errorHandler);

serverConnection(app);
