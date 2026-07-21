import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const authenticatedOrNetworkKey = (req: any) =>
  req.user?.id ? `user:${req.user.id}` : `network:${ipKeyGenerator(req.ip || '')}`;

// General API rate limiter: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Auth endpoints rate limiter: 20 attempts per 15 minutes (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Seed endpoints rate limiter: 5 requests per minute
export const seedLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many seed requests, please try again later.' },
});

// AI analysis rate limiter: 20 requests per hour per user (as required)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authenticatedOrNetworkKey,
  message: { error: 'Too many AI requests, please try again in an hour.' },
});

// AI predictions rate limiter: 20 AI predictions per user per hour
export const aiPredictionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authenticatedOrNetworkKey,
  message: { error: 'AI prediction limit reached. You can make 20 predictions per hour.' },
});

// Strict limiter for sensitive operations: 5 per hour
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Request limit reached for this operation.' },
});
