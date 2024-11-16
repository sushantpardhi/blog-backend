import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    commenter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Adding indexes
commentSchema.index({ blog: 1 });
commentSchema.index({ commenter: 1 });

const Comment = model("Comment", commentSchema);

export default Comment;
