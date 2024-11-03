import { model, Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    content: { type: String, required: true, index: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    likes: { type: Number, default: 0 },
    comments: [
      {
        commenter: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        content: { type: String, required: true, index: true },
        likes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: { type: [String], index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

export default model("Blog", blogSchema);
