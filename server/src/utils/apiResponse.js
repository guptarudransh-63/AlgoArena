/**
 * Standard API response helpers for AlgoArena
 */

const success = (res, data = null, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    status: 'success',
    success: true,
    message,
    data
  });
};

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    success: true,
    message,
    data
  });
};

const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = {
    status: statusCode >= 500 ? 'error' : 'fail',
    success: false,
    message
  };

  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return error(res, message, statusCode, errors);
};

module.exports = {
  success,
  sendSuccess,
  error,
  sendError
};
