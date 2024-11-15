import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
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

// Adding indexes separately
blogSchema.index({ title: 1, content: 1, author: 1, tags: 1, status: 1 });

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

export default mongoose.model("Blog", blogSchema);
