import express from 'express';
import { getParentCommunications, sendCommunication } from '../controllers/communications.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import authorizeAdmin from '../middlewares/allowedTo.js';

const router = express.Router();

// Authentication
router.use(verifyToken);
// Only admin/teacher can send messages
router.use(['/send'], authorizeAdmin);

router.get('/parent/:parentId', getParentCommunications);
router.post('/send', sendCommunication);

export default router;
