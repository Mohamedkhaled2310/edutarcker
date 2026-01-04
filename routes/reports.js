import express from 'express';
import {
  getReports,
  createReport,
  approveReport,
  exportReport
} from '../controllers/reports.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// GET /reports?status=pending&type=weekly
router.get('/', getReports);

// POST /reports
router.post('/', createReport);

// PUT /reports/:id/approve
router.put('/:id/approve', approveReport);

// GET /reports/:id/export
router.get('/:id/export', exportReport);

export default router;
