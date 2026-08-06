import { comparePassword } from '../utils/passwordHelper.js';
import { signAccessToken, signRefreshToken } from '../utils/jwtHelper.js';
import {
  findUserByEmployeeId,
  incrementFailedAttempts,
  resetFailedAttempts,
  recordLoginHistory
} from '../repositories/user.repository.js';


/**
 * Auth Service — Business logic for authentication
 * Handles: login validation, password check, token generation, lockout
 */

export async function loginUser({ employeeId, password, ipAddress, userAgent }) {
  const cleanId = employeeId.trim().toUpperCase();

  // 1. Find user in database
  const user = await findUserByEmployeeId(cleanId);

  if (!user) {
    await recordLoginHistory({ employeeId: cleanId, success: false, ipAddress, userAgent, failureReason: 'Employee ID not found' });
    return { success: false, error: 'Employee ID not found. Please check and try again.' };
  }

  // 2. Check if account is locked
  if (user.is_locked && user.locked_until) {
    const lockedUntil = new Date(user.locked_until);
    if (lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
      await recordLoginHistory({ employeeId: cleanId, success: false, ipAddress, userAgent, failureReason: 'Account locked' });
      return { success: false, error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` };
    }
  }

  // 3. Verify password
  let passwordValid = false;

  if (user.password_hash) {
    // Production: bcrypt comparison
    passwordValid = await comparePassword(password, user.password_hash);
  } else if (user.password) {
    // Legacy/Demo fallback: plain text comparison
    passwordValid = user.password === password;
  }

  if (!passwordValid) {
    await incrementFailedAttempts(cleanId);
    await recordLoginHistory({ employeeId: cleanId, success: false, ipAddress, userAgent, failureReason: 'Wrong password' });
    const remaining = Math.max(0, 5 - (user.failed_attempts || 0) - 1);
    return {
      success: false,
      error: remaining > 0
        ? `Incorrect password. ${remaining} attempt(s) remaining before account lockout.`
        : 'Account locked due to too many failed attempts. Try again in 30 minutes.'
    };
  }

  // 4. Login successful — reset failed attempts, update last_login
  await resetFailedAttempts(cleanId);
  await recordLoginHistory({ employeeId: cleanId, success: true, ipAddress, userAgent });

  // 5. Build token payload (never include password or sensitive fields)
  const tokenPayload = {
    userId: user.id,
    employeeId: user.employee_id || user.employeeId,
    name: user.name,
    role: user.role,
    department: user.department
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user.id });

  // 6. Return user profile + tokens
  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      employeeId: user.employee_id || user.employeeId,
      name: user.name,
      role: user.role,
      department: user.department,
      discipline: user.discipline
    }
  };
}
