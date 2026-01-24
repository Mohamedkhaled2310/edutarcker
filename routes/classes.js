import express from 'express';
import {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    assignClassTeacher,
    removeClassTeacher
} from '../controllers/class.js';

const router = express.Router();

// Get all classes
router.get('/', getClasses);

// Get class by ID
router.get('/:id', getClassById);

// Create new class
router.post('/', createClass);

// Update class
router.put('/:id', updateClass);

// Assign/Update class teacher
router.put('/:id/class-teacher', assignClassTeacher);

// Remove class teacher
router.delete('/:id/class-teacher', removeClassTeacher);

export default router;
