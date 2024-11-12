import { Schema, model } from "mongoose";

// Define a separate schema for replies with recursive replies
const replySchema = new Schema(
  {
    commenter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
  },
  { timestamps: true }
);

// Register the reply schema as a model to allow self-referencing
const Reply = model("Reply", replySchema);

const commentSchema = new Schema(
  {
    commenter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema], // Use the replySchema for nested comments
  },
  { timestamps: true }
);

// Register the comment schema as a model
const Comment = model("Comment", commentSchema);

export default Comment;
