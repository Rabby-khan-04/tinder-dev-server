class AppError extends Error {
  constructor(status, message = "Something went wrong!!", success = false) {
    super(message);
    this.status = status;
    this.message = message;
    this.success = success;
  }
}

module.exports = AppError;
