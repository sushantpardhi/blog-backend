const { default: mongoose } = require("mongoose");

// In your database.js file
exports.databaseConnection = async () => {
  try {
    const mongoURI = process.env.MONGOURI;
    await mongoose.connect(mongoURI);
    console.log(`Connected to database`);
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
