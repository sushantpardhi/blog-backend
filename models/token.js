import { model, Schema } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Token", tokenSchema);
