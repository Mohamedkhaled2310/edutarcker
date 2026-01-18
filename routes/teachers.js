import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  createSupportRecord,
  getTeacherSupportRecords,
  getTeacherStatistics
} from '../controllers/teachers.js';

import { verifyToken } from '../middlewares/verifyToken.js';
import authorizeAdmin from '../middlewares/allowedTo.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeAdmin);

router.get('/statistics/overview', getTeacherStatistics);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.post('/:id/support-records', createSupportRecord);
router.get('/:id/support-records', getTeacherSupportRecords);

export default router;
