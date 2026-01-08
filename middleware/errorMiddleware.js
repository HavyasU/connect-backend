// Centralized error handler
// Ensures consistent shape and proper HTTP codes
const errorMiddleware = (err, req, res, next) => {
  const statusCode =
    typeof err?.statusCode === "number" && err.statusCode >= 400
      ? err.statusCode
      : 500;

  let message = err?.message || "Internal Server Error";

  // Mongoose validation error
  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    message = messages.join(", ") || "Validation error";
  }

  // Mongo duplicate key error
  if (err?.code && err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(", ");
    message = `${fields || "Field"} must be unique`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
