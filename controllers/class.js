import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Class } = models;

/**
 * @desc    Create new class
 * @route   POST /api/classes
 */
export const createClass = asyncWrapper(async (req, res, next) => {
    const { grade, section, academicYear, name,room } = req.body;


    const existingClass = await Class.findOne({ 
        where: { 
            grade, 
            section, 
            academicYear: academicYear || "2025-2026" 
        } 
    });

    if (existingClass) {
        return next(appError.create("هذا الفصل الدراسي مسجل بالفعل لهذا العام", 400, httpStatusText.FAIL));
    }

    const newClass = await Class.create({
        grade,        
        section,
        name: name || `فصل ${grade} - ${section}`, 
        academicYear: academicYear || "2025-2026",
        room
    });

    res.status(201).json({ 
        status: httpStatusText.SUCCESS, // استخدام httpStatusText هنا برضه
        data: { class: newClass } 
    });
});