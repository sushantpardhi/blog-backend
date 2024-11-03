import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    const mongoURI = process.env.MONGOURI;
    await mongoose.connect(mongoURI);
    console.log(`Connected to database`);
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default databaseConnection;
