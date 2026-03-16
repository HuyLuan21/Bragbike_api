const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Log tất cả vào combined.log
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
    // Chỉ log error vào error.log
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    // Hiện ra console khi dev
    ...(process.env.NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
        ]
      : []),
  ],
});

module.exports = logger;
