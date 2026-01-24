function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Unexpected error',
    reason: err.reason || 'unknown',
  };

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error', err);
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
