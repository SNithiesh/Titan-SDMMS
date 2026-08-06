import { db } from '../config/database.js';

/**
 * Audit Logger Middleware
 * Automatically logs every state-changing API call (POST, PATCH, DELETE)
 * Records: who did it, what they did, when, from which IP
 */
export function auditLogger(action, entityType) {
  return async (req, res, next) => {
    // Only log mutating operations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Capture original json() to intercept response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Write audit entry after successful response
      if (body?.status === 'success' && req.user) {
        const entityId = req.params?.id || body?.data?.id || null;
        writeAuditLog({
          userEmployeeId: req.user.employeeId,
          action: action || `${req.method} ${req.path}`,
          entityType: entityType || 'unknown',
          entityId,
          ipAddress: req.ip || req.connection?.remoteAddress
        }).catch(err => console.warn('[AUDIT] Log write failed:', err.message));
      }
      return originalJson(body);
    };

    next();
  };
}

export async function writeAuditLog({ userEmployeeId, action, entityType, entityId, ipAddress }) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_employee_id, action, entity_type, entity_id, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(userEmployeeId, action, entityType, entityId, ipAddress);
  } catch (err) {
    console.warn('[AUDIT] Failed to write audit log:', err.message);
  }
}
