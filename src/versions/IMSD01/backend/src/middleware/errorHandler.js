const { toErrorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const payload = toErrorResponse(err.code || 'internal_error', err.message);
  res.status(status).json(payload);
};

module.exports = {
  errorHandler,
};
