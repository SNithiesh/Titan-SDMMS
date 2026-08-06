import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { successResponse } from '../utils/responseFormatter.js';
import { getAllTechnicians } from '../repositories/user.repository.js';
import { db } from '../config/database.js';

const router = Router();

router.use(authenticate);

// GET /api/machines — All plant machines (used by ComplaintForm selector)
router.get('/', async (req, res, next) => {
  try {
    const data = db.prepare('SELECT * FROM machines ORDER BY code').all();
    return successResponse(res, { machines: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/technicians — Technician list for supervisor dropdown
router.get('/technicians', authorize('Supervisor', 'Admin'), async (req, res, next) => {
  try {
    const technicians = await getAllTechnicians();
    return successResponse(res, { technicians });
  } catch (err) {
    next(err);
  }
});

export default router;
