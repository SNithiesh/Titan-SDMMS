import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Call after authenticate() middleware
 * Usage: authorize('Supervisor', 'Admin')
 *
 * Example:
 *   router.patch('/complaints/:id/assign',
 *     authenticate, authorize('Supervisor', 'Admin'), assignTechnician
 *   );
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return errorResponse(res, 'User role not found in token.', 403, 'FORBIDDEN');
    }

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}
