import express from 'express';
import {
    updateVideoProgress,
    submitAnswer,
    getStudentProgress,
    getLessonProgress,
    completeLesson,
    getStudentStats
} from '../controllers/progress.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// All progress routes require authentication
router.post('/progress/video', verifyToken, updateVideoProgress);
router.post('/progress/answer', verifyToken, submitAnswer);
router.post('/progress/complete', verifyToken, completeLesson);

router.get('/progress/student/:studentId', verifyToken, getStudentProgress);
router.get('/progress/lesson/:lessonId', verifyToken, getLessonProgress);
router.get('/progress/stats/:studentId', verifyToken, getStudentStats);

export default router;
