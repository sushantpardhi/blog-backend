import express from "express";
import { getBlogById } from "./controllers/blogController.js";

const router = express.Router();

// ...existing code...

router.get("/blogs/:id", getBlogById);

// ...existing code...

export default router;
