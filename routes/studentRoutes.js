import express from 'express';
import { 
    getAllStudents, 
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/student.js';

const router = express.Router();

router.get('/all-student',getAllStudents);

router.post('/create-student', createStudent);

router.route('/spacific-student/:id')
.get(getStudentById)
.put(updateStudent)
.delete(deleteStudent);

export default router;