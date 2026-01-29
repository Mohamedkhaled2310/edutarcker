import express from 'express';
import {
    createViolation,
    createPositiveBehavior,
    getViolations,
    getPositiveBehaviors,
    updateViolationStatus
} from '../controllers/behavior.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

router.get('/violations', getViolations);

router.post('/create-violations', createViolation);

router.get('/positive', getPositiveBehaviors);

router.post('/create-positive', createPositiveBehavior);

router.patch('/violations/status/:id', updateViolationStatus);

export default router;