import { CustomError } from "./customError.js";
import { logger } from "./logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token. Please login again.",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format.",
    });
  }

  if (err.code && err.code === 11000) {
    return res.status(409).json({
      status: "fail",
      message: "Duplicate key error. Resource already exists.",
    });
  }

  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
