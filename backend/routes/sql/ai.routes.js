import express from 'express';
import { aiChatHandler, aiValidators } from '../../controllers/sql/ai.controller.js';
import { validateRequest } from '../../middleware/validate.js';

const router = express.Router();

router.post('/', aiValidators, validateRequest, aiChatHandler);

export default router;
