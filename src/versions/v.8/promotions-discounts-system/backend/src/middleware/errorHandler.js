function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: "INTERNAL_ERROR",
    message: err.message || "Unexpected error",
  });
}

module.exports = { errorHandler };
