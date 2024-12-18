import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    tags: { type: [String] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Adding indexes
blogSchema.index({ title: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1 });

// Refactored like method
blogSchema.methods.like = async function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likes += 1;
    this.likedBy.push(userId);
    await this.save();
  }
};

// Refactored unlike method
blogSchema.methods.unlike = async function (userId) {
  const index = this.likedBy.indexOf(userId);
  if (index !== -1) {
    this.likes -= 1;
    this.likedBy.splice(index, 1);
    await this.save();
  }
};

export default mongoose.model("Blog", blogSchema);
