const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error (E11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : 'value';
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return new AppError(message, 409, [{ field, message }]);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => ({
    field: el.path,
    message: el.message
  }));
  const message = `Invalid input data: ${errors.map((e) => e.message).join('. ')}`;
  return new AppError(message, 400, errors);
};

/**
 * Handle Zod Validation Error
 */
const handleZodError = (err) => {
  const errors = (err.errors || err.issues || []).map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
  const message = `Validation error: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`;
  return new AppError(message, 400, errors);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Send detailed error in development
 */
const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    errors: err.errors || null,
    stack: err.stack,
    error: err
  });
};

/**
 * Send user-friendly error in production
 */
const sendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const payload = {
      success: false,
      message: err.message
    };
    if (err.errors) {
      payload.errors = err.errors;
    }
    return res.status(statusCode).json(payload);
  }

  // Programming or other unknown error: don't leak error details
  console.error('[ERROR 💥]', err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred on the server.'
  });
};

/**
 * Centralized error handling middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;
  error.code = err.code;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'ZodError') error = handleZodError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (config.isProduction) {
    sendErrorProd(error, res);
  } else {
    sendErrorDev(error, res);
  }
};

module.exports = errorHandler;
