import express from 'express';
import { getStudentGrades, recordGrade } from '../controllers/grades.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import authorizeAdmin from '../middlewares/allowedTo.js';

const router = express.Router();

// Authentication
router.use(verifyToken);
// Only admin/teacher can record grades
router.use(['/','POST'], authorizeAdmin);

router.get('/student/:studentId', getStudentGrades);
router.post('/', recordGrade);

export default router;
