import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function requiredAuthConfig() {
  const jwtSecret = process.env.JWT_SECRET || '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
  const tenantId = process.env.DEFAULT_TENANT_ID || '';
  if (jwtSecret.length < 32 || refreshSecret.length < 32 || tenantId.length < 8) {
    throw new Error('secure JWT secrets and DEFAULT_TENANT_ID are required');
  }
  return { jwtSecret, refreshSecret, tenantId };
}

// Generate tokens
const generateTokens = (userId: string, email: string, role: string) => {
  const config = requiredAuthConfig();
  const subjects = ['admin', 'operator'].includes(role) ? ['*'] : [userId];
  const accessToken = jwt.sign(
    { userId, email, role, tenantId: config.tenantId, subjects },
    config.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'], algorithm: 'HS256' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, tenantId: config.tenantId, subjects, type: 'refresh' },
    config.refreshSecret,
    { expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'], algorithm: 'HS256' }
  );

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Create empty cart for user
    await query(
      'INSERT INTO carts (user_id) VALUES ($1)',
      [user.id]
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, role, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      // Revoke refresh token
      await query(
        `UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`,
        [refreshToken]
      );
    }

    // Revoke all refresh tokens for user (optional, for logout from all devices)
    if (req.body.logoutAll && req.user) {
      await query(
        `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`,
        [req.user.id]
      );
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, requiredAuthConfig().refreshSecret, { algorithms: ['HS256'] }) as {
        userId: string;
        email: string;
        role: string;
        tenantId: string;
        subjects: string[];
        type: string;
      };
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Check if token exists and is not revoked
    const tokenResult = await query(
      `SELECT id FROM refresh_tokens
       WHERE token = $1 AND user_id = $2 AND is_revoked = FALSE AND expires_at > NOW()`,
      [token, decoded.userId]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token expired or revoked' });
    }

    // Revoke old token
    await query(
      `UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`,
      [token]
    );

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.email,
      decoded.role
    );

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [decoded.userId, newRefreshToken, expiresAt]
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Return the same fail-closed response regardless of account existence.
    void result;
    res.status(503).json({ error: 'Password reset delivery is not configured' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Password reset token verification is not configured' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Email verification delivery is not configured' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, phone, avatar_url, is_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get user addresses
    const addressResult = await query(
      `SELECT id, label, street_address, apartment, city, state, zip_code, is_default
       FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
      addresses: addressResult.rows.map(addr => ({
        id: addr.id,
        label: addr.label,
        streetAddress: addr.street_address,
        apartment: addr.apartment,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        isDefault: addr.is_default,
      })),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
