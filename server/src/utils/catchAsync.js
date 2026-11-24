/**
 * Wraps an asynchronous Express route handler to catch errors and pass them to next().
 * @param {Function} fn - Async middleware function
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
