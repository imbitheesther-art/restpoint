const { Logger } = require('../../utilities/logger/logger');

const errorHandler = (err, req, res, next) => {

  Logger.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
