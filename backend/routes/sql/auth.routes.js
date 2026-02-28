import express from 'express';
import { login, loginValidators, me, register, registerValidators } from '../../controllers/sql/auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidators, validateRequest, register);
router.post('/login', loginValidators, validateRequest, login);
router.get('/me', requireAuth, me);

export default router;
