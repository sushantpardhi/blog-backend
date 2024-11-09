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
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
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

blogSchema.methods.like = async function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likes += 1;
    this.likedBy.push(userId);
    await this.save();
  }
};

blogSchema.methods.unlike = async function (userId) {
  const index = this.likedBy.indexOf(userId);
  if (index !== -1) {
    this.likes -= 1;
    this.likedBy.splice(index, 1);
    await this.save();
  }
};

export default model("Blog", blogSchema);
