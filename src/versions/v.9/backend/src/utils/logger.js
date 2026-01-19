const logInfo = (message, meta = {}) => {
  console.log(`[info] ${message}`, meta);
};

const logError = (message, meta = {}) => {
  console.error(`[error] ${message}`, meta);
};

module.exports = {
  logInfo,
  logError,
};
