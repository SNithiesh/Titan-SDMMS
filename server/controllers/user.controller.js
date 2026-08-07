import bcrypt from 'bcryptjs';
import { getAllUsers, createUser, updateUser, deleteUser, findUserByEmployeeId } from '../repositories/user.repository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { writeAuditLog } from '../middleware/auditLogger.js';

export async function listUsers(req, res, next) {
  try {
    const users = await getAllUsers();
    return successResponse(res, { users });
  } catch (err) {
    next(err);
  }
}

export async function addUser(req, res, next) {
  try {
    const { employeeId, name, role, department, discipline, password } = req.body;

    if (!employeeId || !name || !role || !password) {
      return errorResponse(res, 'Employee ID, Name, Role, and Password are required', 400);
    }

    // Check if user already exists
    const existing = await findUserByEmployeeId(employeeId);
    if (existing) {
      return errorResponse(res, 'A user with this Employee ID already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      employeeId,
      name,
      role,
      department,
      discipline,
      passwordHash
    });

    await writeAuditLog({
      userEmployeeId: req.user.employeeId,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: newUser.id.toString(),
      ipAddress: req.ip
    });

    return successResponse(res, { user: newUser }, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function editUser(req, res, next) {
  try {
    const { id } = req.params;
    const { employeeId, name, role, department, discipline, password } = req.body;

    const updates = { employeeId, name, role, department, discipline };
    
    if (password && password.trim() !== '') {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await updateUser(id, updates);

    await writeAuditLog({
      userEmployeeId: req.user.employeeId,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, { user: updatedUser }, 'User updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function removeUser(req, res, next) {
  try {
    const { id } = req.params;
    
    // Optional: Prevent admin from deleting themselves
    if (req.user.employeeId === id) {
      // Note: id here is DB primary key, req.user.employeeId is the string EMP-XXX. 
      // Need to fetch user to compare
    }

    await deleteUser(id);

    await writeAuditLog({
      userEmployeeId: req.user.employeeId,
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
}
