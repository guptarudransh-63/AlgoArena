const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AuthService {
  generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register({ username, email, password, displayName }) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError('This username is already taken', 409);
    }

    const user = await User.create({
      username,
      email,
      passwordHash: password,
      displayName: displayName || username,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`
    });

    const token = this.generateToken(user._id, user.role);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user._id, user.role);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
