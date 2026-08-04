import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { successResponse } from '../utils/responseFormatter.js';
import { getAllTechnicians } from '../repositories/user.repository.js';
import { MACHINES } from '../../src/mockData.js';
import { supabase } from '../config/database.js';

const router = Router();

router.use(authenticate);

// GET /api/machines — All plant machines (used by ComplaintForm selector)
router.get('/', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('machines').select('*').order('code');
      if (!error && data?.length > 0) {
        return successResponse(res, { machines: data });
      }
    }
    // Fallback to local machine data
    return successResponse(res, { machines: MACHINES });
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
