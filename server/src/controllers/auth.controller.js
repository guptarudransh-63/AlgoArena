const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const config = require('../config');

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res.cookie('token', token, cookieOptions);

  sendSuccess(res, { user, token }, 'User registered successfully', 201);
});

const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.cookie('token', token, cookieOptions);

  sendSuccess(res, { user, token }, 'Logged in successfully', 200);
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax'
  });

  sendSuccess(res, null, 'Logged out successfully', 200);
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  sendSuccess(res, { user }, 'Current user retrieved successfully', 200);
});

module.exports = {
  register,
  login,
  logout,
  getMe
};
