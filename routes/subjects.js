import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjects.js';

import { verifyToken } from '../middlewares/verifyToken.js';
import authorizeAdmin from '../middlewares/allowedTo.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeAdmin);

router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
