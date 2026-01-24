import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Class, Teacher, Student } = models;

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 */
export const getClasses = asyncWrapper(async (req, res) => {
    const { grade, academicYear, status } = req.query;

    const whereClause = {
        ...(grade && { grade }),
        ...(academicYear && { academicYear }),
        ...(status && { status })
    };

    const classes = await Class.findAll({
        where: whereClause,
        include: [
            {
                model: Teacher,
                as: 'classTeacher',
                attributes: ['id', 'name', 'employeeId', 'email']
            },
            {
                model: Student,
                as: 'students',
                attributes: ['id']
            }
        ],
        order: [['grade', 'ASC'], ['section', 'ASC']]
    });

    const formattedClasses = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academicYear,
        capacity: cls.capacity,
        room: cls.room,
        status: cls.status,
        classTeacherId: cls.classTeacherId,
        classTeacher: cls.classTeacher ? {
            id: cls.classTeacher.id,
            name: cls.classTeacher.name,
            employeeId: cls.classTeacher.employeeId,
            email: cls.classTeacher.email
        } : null,
        studentCount: cls.students?.length || 0
    }));

    res.status(200).json({
        success: true,
        data: formattedClasses
    });
});

/**
 * @desc    Get class by ID
 * @route   GET /api/classes/:id
 */
export const getClassById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const classData = await Class.findByPk(id, {
        include: [
            {
                model: Teacher,
                as: 'classTeacher',
                attributes: ['id', 'name', 'employeeId', 'email', 'phone']
            },
            {
                model: Student,
                as: 'students',
                attributes: ['id', 'name', 'studentId']
            }
        ]
    });

    if (!classData) {
        return next(appError.create('الفصل غير موجود', 404, httpStatusText.FAIL));
    }

    res.status(200).json({
        success: true,
        data: classData
    });
});

/**
 * @desc    Create new class
 * @route   POST /api/classes
 */
export const createClass = asyncWrapper(async (req, res, next) => {
    const { grade, section, academicYear, name, classTeacherId } = req.body;

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

    // Validate teacher if provided
    if (classTeacherId) {
        const teacher = await Teacher.findByPk(classTeacherId);
        if (!teacher) {
            return next(appError.create("المعلم غير موجود", 404, httpStatusText.FAIL));
        }
    }

    const newClass = await Class.create({
        grade,
        section,
        name: name || `فصل ${grade} - ${section}`,
        academicYear: academicYear || "2025-2026",
        classTeacherId: classTeacherId || null
    });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { class: newClass }
    });
});

/**
 * @desc    Update class
 * @route   PUT /api/classes/:id
 */
export const updateClass = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    const classData = await Class.findByPk(id);
    if (!classData) {
        return next(appError.create('الفصل غير موجود', 404, httpStatusText.FAIL));
    }

    // Validate teacher if being updated
    if (updateData.classTeacherId) {
        const teacher = await Teacher.findByPk(updateData.classTeacherId);
        if (!teacher) {
            return next(appError.create("المعلم غير موجود", 404, httpStatusText.FAIL));
        }
    }

    await classData.update(updateData);

    res.status(200).json({
        success: true,
        message: 'تم تحديث الفصل بنجاح',
        data: classData
    });
});

/**
 * @desc    Assign/Update class teacher
 * @route   PUT /api/classes/:id/class-teacher
 */
export const assignClassTeacher = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { classTeacherId } = req.body;

    if (!classTeacherId) {
        return next(appError.create('يرجى تحديد المعلم', 400, httpStatusText.FAIL));
    }

    const classData = await Class.findByPk(id);
    if (!classData) {
        return next(appError.create('الفصل غير موجود', 404, httpStatusText.FAIL));
    }

    const teacher = await Teacher.findByPk(classTeacherId);
    if (!teacher) {
        return next(appError.create('المعلم غير موجود', 404, httpStatusText.FAIL));
    }

    await classData.update({ classTeacherId });

    // Fetch updated class with teacher info
    const updatedClass = await Class.findByPk(id, {
        include: [{
            model: Teacher,
            as: 'classTeacher',
            attributes: ['id', 'name', 'employeeId', 'email']
        }]
    });

    res.status(200).json({
        success: true,
        message: 'تم تعيين رائد الفصل بنجاح',
        data: updatedClass
    });
});

/**
 * @desc    Remove class teacher
 * @route   DELETE /api/classes/:id/class-teacher
 */
export const removeClassTeacher = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const classData = await Class.findByPk(id);
    if (!classData) {
        return next(appError.create('الفصل غير موجود', 404, httpStatusText.FAIL));
    }

    await classData.update({ classTeacherId: null });

    res.status(200).json({
        success: true,
        message: 'تم إزالة رائد الفصل بنجاح'
    });
});
