import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { BehaviorRecord, Student, Teacher } = models;

/**
 * @desc    Record new behavior violation using studentIdCode and authenticated user
 * @route   POST /api/behavior/violations
 * @method  POST
 * @access  Admin/Teacher
 */
const createViolation = asyncWrapper(async (req, res, next) => {
    const {
        studentIdCode,
        type,
        severity,
        description,
        date,
        marksDeducted,
        occurrenceCount,
        behaviorNotes,
        isChildProtectionCase
    } = req.body;

    // Validate marksDeducted range
    if (marksDeducted !== undefined && (marksDeducted < 0 || marksDeducted > 4)) {
        return next(appError.create('Marks deducted must be between 0 and 4', 400, httpStatusText.FAIL));
    }

    const student = await Student.findOne({ where: { studentId: studentIdCode } });
    if (!student) {
        return next(appError.create(`Student with code ${studentIdCode} not found`, 404, httpStatusText.FAIL));
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
        return next(appError.create('User not authenticated', 401, httpStatusText.FAIL));
    }

    // Use authenticated user's ID directly (works for both admin and teachers)
    const violation = await BehaviorRecord.create({
        studentId: student.id,
        reportedById: req.user.id,
        type,
        category: 'violation',
        severity,
        description,
        date: date || new Date(),
        status: 'pending',
        points: 0,
        marksDeducted: marksDeducted || 0,
        occurrenceCount: occurrenceCount || 1,
        behaviorNotes: behaviorNotes || null,
        isChildProtectionCase: isChildProtectionCase || false
    });

    // Deduct marks from student's behavior score if specified
    if (marksDeducted && marksDeducted > 0) {
        await student.decrement('behaviorScore', { by: marksDeducted });
        await student.reload();
    }

    res.status(201).json({
        success: true,
        message: "Violation recorded successfully",
        data: {
            id: violation.id,
            studentName: student.name,
            reportedBy: req.user.id, // Using user ID since we don't have user name in token
            date: violation.date,
            marksDeducted: violation.marksDeducted,
            occurrenceCount: violation.occurrenceCount,
            isChildProtectionCase: violation.isChildProtectionCase,
            currentBehaviorScore: student.behaviorScore
        }
    });
});

/**
 * @desc    Record positive behavior using studentIdCode and authenticated user
 * @route   POST /api/behavior/positive
 * @method  POST
 * @access  Admin/Teacher
 */
const createPositiveBehavior = asyncWrapper(async (req, res, next) => {
    const { studentIdCode, type, description, points, date } = req.body;

    const student = await Student.findOne({ where: { studentId: studentIdCode } });
    if (!student) {
        return next(appError.create("Student not found", 404, httpStatusText.FAIL));
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
        return next(appError.create('User not authenticated', 401, httpStatusText.FAIL));
    }

    const pointsToAdd = points || 10;

    // Use authenticated user's ID directly (works for both admin and teachers)
    const record = await BehaviorRecord.create({
        studentId: student.id,
        reportedById: req.user.id,
        type,
        category: 'positive',
        description,
        points: pointsToAdd,
        date: date || new Date(),
        status: 'resolved'
    });

    await student.increment('behaviorScore', { by: pointsToAdd });

    res.status(201).json({
        success: true,
        message: "Positive behavior recorded and points added to student balance",
        data: {
            id: record.id,
            studentName: student.name,
            pointsAwarded: record.points,
            currentScore: student.behaviorScore
        }
    });
});

/**
 * @desc    Get behavior violations with pagination, filters and stats
 * @route   GET /api/behavior/violations
 * @method  GET
 * @access  Admin/Teacher
 */
const getViolations = asyncWrapper(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const { severity, status, isChildProtectionCase } = req.query;

    const whereClause = { category: 'violation' };
    if (severity) whereClause.severity = severity;
    if (status) whereClause.status = status;
    if (isChildProtectionCase !== undefined) {
        whereClause.isChildProtectionCase = isChildProtectionCase === 'true';
    }

    const { count, rows } = await BehaviorRecord.findAndCountAll({
        where: whereClause,
        limit,
        offset: skip,
        order: [['date', 'DESC']],
        include: [
            {
                model: Student,
                as: 'student',
                attributes: ['id', 'name', 'studentId', 'behaviorScore']
            },
            {
                model: models.User,
                as: 'reportedBy',
                attributes: ['id', 'name']
            }
        ]
    });

    const formattedViolations = rows.map(v => ({
        id: v.id,
        studentId: v.student?.studentId,
        studentName: v.student?.name,
        type: v.type,
        severity: v.severity,
        description: v.description,
        date: v.date,
        reportedBy: v.reportedBy?.name || 'Unknown',
        status: v.status,
        action: v.action,
        currentScore: v.student?.behaviorScore,
        marksDeducted: v.marksDeducted,
        occurrenceCount: v.occurrenceCount,
        behaviorNotes: v.behaviorNotes,
        isChildProtectionCase: v.isChildProtectionCase
    }));

    res.status(200).json({
        success: true,
        data: {
            violations: formattedViolations,
            stats: {
                total: count,
                pending: await BehaviorRecord.count({ where: { category: 'violation', status: 'pending' } }),
                resolved: await BehaviorRecord.count({ where: { category: 'violation', status: 'resolved' } }),
                childProtectionCases: await BehaviorRecord.count({ where: { category: 'violation', isChildProtectionCase: true } })
            }
        }
    });
});
/**
 * @desc    Get all positive behavior records
 * @route   GET /api/behavior/positive
 * @method  GET
 * @access  Admin/Teacher
 */
const getPositiveBehaviors = asyncWrapper(async (req, res, next) => {
    const records = await BehaviorRecord.findAll({
        where: { category: 'positive' },
        order: [['date', 'DESC']],
        include: [
            {
                model: Student,
                as: 'student',
                attributes: ['id', 'name', 'studentId', 'behaviorScore']
            },
            {
                model: models.User,
                as: 'reportedBy',
                attributes: ['id', 'name']
            }
        ]
    });

    const formattedRecords = records.map(r => ({
        id: r.id,
        studentId: r.student?.studentId,
        studentName: r.student?.name,
        type: r.type,
        description: r.description,
        date: r.date,
        awardedBy: r.reportedBy?.name || 'Unknown',
        currentScore: r.student?.behaviorScore
    }));

    res.status(200).json({
        success: true,
        data: formattedRecords
    });
});
/**
 * @desc    Update violation status and record action taken
 * @route   PATCH /api/behavior/violations/:id/status
 * @method  PATCH
 * @access  Admin/Counselor
 */
const updateViolationStatus = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { status, action, points } = req.body;

    const violation = await BehaviorRecord.findByPk(id, {
        include: [{ model: Student, as: 'student' }]
    });

    if (!violation) {
        return next(appError.create("Violation record not found", 404, httpStatusText.FAIL));
    }

    const isBecomingResolved = status === 'resolved' && violation.status !== 'resolved';

    violation.status = status || violation.status;
    violation.action = action || violation.action;

    if (points !== undefined) {
        violation.points = points;
    }

    await violation.save();

    if (isBecomingResolved && violation.points < 0) {
        await violation.student.decrement('behaviorScore', { by: Math.abs(violation.points) });
    }
    await violation.student.reload();
    res.status(200).json({
        success: true,
        message: "Violation resolved and points deducted from student balance",
        data: {
            id: violation.id,
            status: violation.status,
            action: violation.action,
            currentStudentScore: violation.student.behaviorScore
        }
    });
});
export {
    createViolation,
    createPositiveBehavior,
    getViolations,
    getPositiveBehaviors,
    updateViolationStatus
};