class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const sendResponse = (res, statusCode, data, message) => {
  const response = new ApiResponse(statusCode, data, message);
  return res.status(statusCode).json({
    success: response.success,
    message: response.message,
    data: response.data,
  });
};

module.exports = { ApiResponse, sendResponse };