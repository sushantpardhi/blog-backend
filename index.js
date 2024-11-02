const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");

const { serverConnection } = require("./utils/server");

const app = express();
app.use(cookieParser());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

app.get("/", (req, res) => {
  res.status(200).json("Hello");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);

serverConnection(app);
