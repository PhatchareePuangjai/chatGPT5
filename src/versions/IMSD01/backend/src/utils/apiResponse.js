const toSuccessResponse = (data) => ({
  success: true,
  data,
});

const toErrorResponse = (error, message) => ({
  success: false,
  error,
  message,
});

module.exports = {
  toSuccessResponse,
  toErrorResponse,
};
