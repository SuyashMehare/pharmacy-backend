const logger = require("../../utils/logger");
const ApiError = require("../../utils/ApiError");

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }
  // Log the error stack in development
  if (process.env.NODE_ENV === "development") {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${error.statusCode}, Message:: ${error.message}`);
    if (error.stack) logger.error(error.stack);
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  // Include validation errors if they exist
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;