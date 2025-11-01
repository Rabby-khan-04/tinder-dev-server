const { status } = require("http-status");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || status.INTERNAL_SERVER_ERROR;
  let message = err.message;

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => {
      if (val.name === "CastError")
        return `Invalid value for ${val.path} : ${val.value}`;
      return val.message;
    });
    message = messages.join(", ");
    statusCode = status.BAD_REQUEST;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    message = `${field} ${value} is already exists!`;
    statusCode = status.BAD_REQUEST;
  }
  return res.status(statusCode).json({ success: false, message: message });
};

module.exports = globalErrorHandler;
