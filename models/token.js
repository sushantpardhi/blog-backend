import { model, Schema } from "mongoose";

const tokenSchema = Schema({
  token: {
    type: String,
  },
});

export default model("token", tokenSchema);
