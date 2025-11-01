const { status } = require("http-status");
const AppError = require("../utlis/AppError");

const notFoundRouteHandler = (req, res) => {
  throw new AppError(status.NOT_FOUND, `Route not found: ${req.originalUrl}`);
};

module.exports = notFoundRouteHandler;
