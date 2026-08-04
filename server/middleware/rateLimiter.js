import rateLimit from 'express-rate-limit';

/**
 * Login rate limiter: Max 10 attempts per IP in 15 minutes
 * After 10 failed tries, user must wait 15 minutes
 * Protects against brute force password attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts from this device. Please wait 15 minutes and try again.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * General API rate limiter: 200 requests per minute per IP
 * Prevents API abuse
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please slow down.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});
