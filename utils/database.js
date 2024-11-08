import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    const mongoURI = process.env.MONGOURI;
    if (!mongoURI) {
      throw new Error("MONGOURI is not defined in environment variables");
    }
    await mongoose.connect(mongoURI);
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default databaseConnection;
