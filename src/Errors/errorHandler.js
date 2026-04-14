const { isHttpError } = require("http-errors");
const logger = require("../config/logger");
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ✅ Log warn cho 4xx, error cho 5xx
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      statusCode,
      method: req.method,
      url: req.url,
      stack: err.stack,
    });
  } else if (statusCode >= 400) {
    logger.warn({
      message: err.message,
      statusCode,
      method: req.method,
      url: req.url,
    });
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
