import { loginUser } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * Auth Controller — Handles HTTP request/response for auth endpoints
 * Calls auth service for business logic, then formats response
 */

/**
 * POST /api/auth/login
 * Body: { employeeId, password }
 */
export async function login(req, res, next) {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return errorResponse(res, 'Employee ID and password are required.', 400, 'MISSING_FIELDS');
    }

    const result = await loginUser({
      employeeId,
      password,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (!result.success) {
      return errorResponse(res, result.error, 401, 'AUTH_FAILED');
    }

    return successResponse(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    }, 'Login successful');

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears session (client handles token removal)
 */
export async function logout(req, res) {
  // With JWT, logout is handled client-side by removing the token
  // For enhanced security, a token blacklist could be added here
  return successResponse(res, null, 'Logged out successfully');
}

/**
 * GET /api/auth/me
 * Returns current user profile from the JWT token
 */
export async function getMe(req, res) {
  return successResponse(res, req.user, 'Current user profile');
}
