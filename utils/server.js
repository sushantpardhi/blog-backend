import databaseConnection from "./database.js";

const serverConnection = async (app) => {
  try {
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server is running on port : ${port}`);
    });
    await databaseConnection();
  } catch (e) {
    console.error(
      "Failed to start server due to database connection error:",
      e
    );
    process.exit(1);
  }
};

export default serverConnection;
