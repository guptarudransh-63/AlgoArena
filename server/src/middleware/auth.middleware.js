const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Extract token from httpOnly cookie or Authorization Bearer header
 */
const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * Authenticate middleware:
 * Extracts JWT token, verifies signature, retrieves active user from DB,
 * and attaches sanitized user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select('+isActive');
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    };

    next();
  } catch (err) {
    req.user = null;
    next(err);
  }
};

/**
 * requireAuth middleware:
 * Requires user to be authenticated. Returns 401 if not.
 */
const requireAuth = (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }
    if (!req.user) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }
    next();
  });
};

/**
 * requireAdmin middleware:
 * Requires user to be authenticated with 'admin' role. Returns 403 if not admin.
 */
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) {
      return next(err);
    }
    if (req.user.role !== 'admin') {
      return next(new AppError('Access denied. Administrator privileges required.', 403));
    }
    next();
  });
};

/**
 * optionalAuth middleware:
 * Attempts authentication if token is provided, but continues regardless.
 */
const optionalAuth = (req, res, next) => {
  authenticate(req, res, () => {
    // Suppress any errors, optional auth simply leaves req.user null
    next();
  });
};

module.exports = {
  authenticate,
  requireAuth,
  requireAdmin,
  optionalAuth
};
