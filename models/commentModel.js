import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    commenter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Adding indexes
commentSchema.index({ blog: 1, commenter: 1 }); // Compound index for combined queries

const Comment = model("Comment", commentSchema);

export default Comment;
