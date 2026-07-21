import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    subjects: string[];
  };
}

type SignedClaims = {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  subjects: string[];
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return secret;
}

function validClaims(value: Partial<SignedClaims>): value is SignedClaims {
  return typeof value.userId === 'string' && typeof value.email === 'string'
    && typeof value.tenantId === 'string' && value.tenantId.length >= 8
    && typeof value.role === 'string' && Array.isArray(value.subjects)
    && value.subjects.every((subject) => typeof subject === 'string');
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as Partial<SignedClaims>;
    if (!validClaims(decoded)) return res.status(403).json({ error: 'signed tenant, role, and subject claims required' });

    // Verify user still exists and is active
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    if (result.rows[0].role !== decoded.role) return res.status(403).json({ error: 'signed role is stale' });
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
      subjects: decoded.subjects,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as Partial<SignedClaims>;
    if (!validClaims(decoded)) return next();

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
      subjects: decoded.subjects,
    };
  } catch (error) {
    // Token invalid but continue without auth
  }

  next();
};
