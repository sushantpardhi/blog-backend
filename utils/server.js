import databaseConnection from "./database.js";

const serverConnection = async (app) => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
  });

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await databaseConnection();
      console.log("Database connected successfully");
      break;
    } catch (e) {
      retries += 1;
      console.error(
        `Failed to connect to database (attempt ${retries} of ${maxRetries}):`,
        e
      );
      if (retries === maxRetries) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  process.exit();
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default serverConnection;
