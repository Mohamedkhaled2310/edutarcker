import express from 'express';
import { 
    getAttendance, 
    recordAttendance, 
    getStudentAttendanceHistory 
} from '../controllers/attendance.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import  authorizeAdmin  from '../middlewares/allowedTo.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeAdmin);

router.get('/return-attendance', getAttendance);


router.post('/record-attend', recordAttendance);

router.get('/attend/:studentId', getStudentAttendanceHistory);

export default router;