import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import commentController from "../controllers/commentController.js";

const router = express.Router();
const comment = new commentController();

router.post("/add/:id", verifyToken, comment.addComment);
router.put("/update/:id", verifyToken, comment.updateComment);

export default router;
