import { verifyAccessToken } from '../utils/jwtHelper.js';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Middleware: Verify JWT token on every protected route
 * Extracts token from Authorization header: "Bearer <token>"
 * Sets req.user = decoded payload for downstream use
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No authentication token provided. Please login.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, employeeId, role, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please login again.', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
}
