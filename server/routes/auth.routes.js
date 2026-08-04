import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/auth/login — rate limited to prevent brute force
router.post('/login', loginLimiter, login);

// POST /api/auth/logout — requires valid token
router.post('/logout', authenticate, logout);

// GET /api/auth/me — get current user profile from token
router.get('/me', authenticate, getMe);

export default router;
