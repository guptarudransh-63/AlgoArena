/**
 * Middleware factory to validate request body (and optionally query/params) with Zod
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Support object containing body, query, or params schemas
      if (schema.body || schema.query || schema.params) {
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
          req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }
      } else {
        // Default: validate req.body against schema
        req.body = schema.parse(req.body);
      }
      next();
    } catch (err) {
      if (err.errors || err.issues) {
        const formattedErrors = (err.errors || err.issues).map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error: Invalid input data',
          errors: formattedErrors
        });
      }
      next(err);
    }
  };
};

module.exports = validate;
