import mongoose, { Schema } from "mongoose";
import Comment from "./commentModel.js";

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [Comment.schema],
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
blogSchema.index({ "comments.commenter": 1, "comments.content": 1 });

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

blogSchema.methods.likeComment = async function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && !comment.likedBy.includes(userId)) {
    comment.likes += 1;
    comment.likedBy.push(userId);
    await this.save();
  }
};

blogSchema.methods.unlikeComment = async function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    const index = comment.likedBy.indexOf(userId);
    if (index !== -1) {
      comment.likes -= 1;
      comment.likedBy.splice(index, 1);
      await this.save();
    }
  }
};

blogSchema.methods.replyToComment = async function (parentId, reply) {
  const addReplyToComment = (comments, parentId, reply) => {
    for (let comment of comments) {
      if (comment._id.toString() === parentId) {
        comment.replies.push(reply);
        return true;
      }
      if (addReplyToComment(comment.replies, parentId, reply)) {
        return true;
      }
    }
    return false;
  };

  if (!addReplyToComment(this.comments, parentId, reply)) {
    throw new Error("Parent comment not found");
  }

  await this.save();
};

blogSchema.methods.likeReply = async function (parentId, commentId, userId) {
  const parentComment = this.comments.id(parentId);
  if (parentComment) {
    const reply = parentComment.replies.id(commentId);
    if (reply && !reply.likedBy.includes(userId)) {
      reply.likes += 1;
      reply.likedBy.push(userId);
      await this.save();
    }
  }
};

blogSchema.methods.unlikeReply = async function (parentId, commentId, userId) {
  const parentComment = this.comments.id(parentId);
  if (parentComment) {
    const reply = parentComment.replies.id(commentId);
    if (reply) {
      const index = reply.likedBy.indexOf(userId);
      if (index !== -1) {
        reply.likes -= 1;
        reply.likedBy.splice(index, 1);
        await this.save();
      }
    }
  }
};

export default mongoose.model("Blog", blogSchema);
