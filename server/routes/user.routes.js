import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { listUsers, addUser, editUser, removeUser } from '../controllers/user.controller.js';

const router = Router();

// All user management routes require Admin privileges
router.use(authenticate);
router.use(authorize('Admin'));

router.get('/', listUsers);
router.post('/', addUser);
router.put('/:id', editUser);
router.delete('/:id', removeUser);

export default router;
