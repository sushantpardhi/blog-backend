import { model, Schema } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // Ensure tokens are unique
      index: true,  // Add index for faster queries
    },
  },
  { timestamps: true }
);

export default model("Token", tokenSchema);
