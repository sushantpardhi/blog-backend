import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
});

// Adding indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") && !this.isPasswordReset) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing password:", error);
    throw error;
  }
};

export default model("User", userSchema);
