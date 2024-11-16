import winston from "winston";
import cloudinary from "../cloudinaryConfig.js";

class CloudinaryTransport extends winston.Transport {
  constructor(opts = {}) {
    super(opts);
    this.name = "cloudinaryTransport";
    this.folder = opts.folder || "logs";
    this.logFileName = `error-logs.json`;
    this.logBuffer = [];
  }

  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    this.logBuffer.push(info);

    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          public_id: this.logFileName,
          folder: this.folder,
          format: "json",
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading log to Cloudinary:", error);
          } else {
            console.log("Log uploaded to Cloudinary:", result.url);
          }
        }
      )
      .end(JSON.stringify(this.logBuffer));

    callback();
  }
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new CloudinaryTransport(),
  ],
});

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export { logger, stream, CloudinaryTransport };
