import express from 'express';
import {
    getLessonsBySubject,
    getLessonById,
    getQuestionsByLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    addQuestion,
    updateQuestion,
    deleteQuestion
} from '../controllers/lessons.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

// Public routes (require authentication)
router.get('/subjects/:subjectId/lessons', verifyToken, getLessonsBySubject);
router.get('/lessons/:id', verifyToken, getLessonById);
router.get('/lessons/:id/questions', verifyToken, getQuestionsByLesson);

// Admin/Teacher only routes
router.post('/lessons', verifyToken, authorizeRoles('admin', 'teacher'), createLesson);
router.put('/lessons/:id', verifyToken, authorizeRoles('admin', 'teacher'), updateLesson);
router.delete('/lessons/:id', verifyToken, authorizeRoles('admin', 'teacher'), deleteLesson);

router.post('/lessons/:id/questions', verifyToken, authorizeRoles('admin', 'teacher'), addQuestion);
router.put('/questions/:id', verifyToken, authorizeRoles('admin', 'teacher'), updateQuestion);
router.delete('/questions/:id', verifyToken, authorizeRoles('admin', 'teacher'), deleteQuestion);

export default router;
