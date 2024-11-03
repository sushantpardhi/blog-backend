import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";

import serverConnection from "./utils/server.js";

const app = express();
app.use(cookieParser());
app.use(express.json());

import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);

serverConnection(app);
