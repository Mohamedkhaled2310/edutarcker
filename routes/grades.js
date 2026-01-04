import express from 'express';
import { getStudentGrades, recordGrade, updateGrade, deleteGrade } from '../controllers/grades.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import authorizeAdmin from '../middlewares/allowedTo.js';

const router = express.Router();

// Authentication
router.use(verifyToken);
// Only admin/teacher can record grades
router.use(['/','POST'], authorizeAdmin);   

router.get('/student/:studentId', getStudentGrades);
router.post('/', recordGrade);
router.put('/', updateGrade);
router.delete('/', deleteGrade);

export default router;
