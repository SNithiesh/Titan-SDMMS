import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'titan_sdmms_fallback_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Sign an access token for a logged-in user
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Sign a refresh token (long-lived, used to get new access tokens)
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify and decode an access token
 * Returns decoded payload or throws error
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_SECRET + '_refresh');
}
