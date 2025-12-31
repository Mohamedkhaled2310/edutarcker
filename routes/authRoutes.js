import express from 'express';
import {
  registerAdmin,
  loginUser,
  logout
} from '../controllers/auth.js';

const router = express.Router();

router.post('/register-admin', registerAdmin); // TEMPORARY
router.post('/login', loginUser);
router.post('/logout', logout);

export default router;
