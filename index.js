import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import serverConnection from "./utils/server.js";
import errorHandler from "./utils/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

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

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);

// Error Handling
app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: "error",
    message: "Something went wrong!",
  });
});

serverConnection(app);
