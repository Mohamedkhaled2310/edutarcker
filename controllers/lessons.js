import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Lesson, Question, Subject, StudentProgress } = models;

/**
 * GET /api/subjects/:subjectId/lessons
 * Get all lessons for a specific subject
 */
const getLessonsBySubject = asyncWrapper(async (req, res) => {
    const { subjectId } = req.params;
    const { status } = req.query;

    const whereClause = {
        subjectId,
        ...(status && { status })
    };

    const lessons = await Lesson.findAll({
        where: whereClause,
        order: [['orderIndex', 'ASC']],
        include: [
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name', 'code']
            }
        ]
    });

    res.status(200).json({
        success: true,
        data: lessons
    });
});

/**
 * GET /api/lessons/:id
 * Get lesson details with questions
 */
const getLessonById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { level, language = 'ar' } = req.query;

    const lesson = await Lesson.findByPk(id, {
        include: [
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name', 'code']
            },
            {
                model: Question,
                as: 'questions',
                where: level ? { level } : {},
                required: false,
                order: [['orderIndex', 'ASC']]
            }
        ]
    });

    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    res.status(200).json({
        success: true,
        data: lesson
    });
});

/**
 * GET /api/lessons/:id/questions
 * Get questions for a lesson filtered by level
 */
const getQuestionsByLesson = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { level } = req.query;

    // Verify lesson exists
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    const whereClause = {
        lessonId: id,
        ...(level && { level })
    };

    const questions = await Question.findAll({
        where: whereClause,
        order: [['orderIndex', 'ASC']],
        attributes: { exclude: ['correctAnswer'] } // Don't send correct answer initially
    });

    res.status(200).json({
        success: true,
        data: questions
    });
});

/**
 * POST /api/lessons
 * Create a new lesson (admin/teacher only)
 */
const createLesson = asyncWrapper(async (req, res, next) => {
    const { subjectId } = req.body;

    // Verify subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
        return next(
            appError.create('المادة غير موجودة', 404, httpStatusText.FAIL)
        );
    }

    const lesson = await Lesson.create(req.body);

    res.status(201).json({
        success: true,
        message: 'تم إضافة الدرس بنجاح',
        data: lesson
    });
});

/**
 * PUT /api/lessons/:id
 * Update a lesson
 */
const updateLesson = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    await lesson.update(req.body);

    res.status(200).json({
        success: true,
        message: 'تم تحديث الدرس بنجاح',
        data: lesson
    });
});

/**
 * DELETE /api/lessons/:id
 * Delete a lesson
 */
const deleteLesson = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    // Check if students have progress on this lesson
    const progressCount = await StudentProgress.count({
        where: { lessonId: id }
    });

    if (progressCount > 0) {
        return next(
            appError.create(
                'لا يمكن حذف الدرس لوجود تقدم طلابي مرتبط به',
                400,
                httpStatusText.FAIL
            )
        );
    }

    await lesson.destroy();

    res.status(200).json({
        success: true,
        message: 'تم حذف الدرس بنجاح'
    });
});

/**
 * POST /api/lessons/:id/questions
 * Add a question to a lesson
 */
const addQuestion = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    // Verify lesson exists
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    const question = await Question.create({
        ...req.body,
        lessonId: id
    });

    res.status(201).json({
        success: true,
        message: 'تم إضافة السؤال بنجاح',
        data: question
    });
});

/**
 * PUT /api/questions/:id
 * Update a question
 */
const updateQuestion = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
        return next(
            appError.create('السؤال غير موجود', 404, httpStatusText.FAIL)
        );
    }

    await question.update(req.body);

    res.status(200).json({
        success: true,
        message: 'تم تحديث السؤال بنجاح',
        data: question
    });
});

/**
 * DELETE /api/questions/:id
 * Delete a question
 */
const deleteQuestion = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
        return next(
            appError.create('السؤال غير موجود', 404, httpStatusText.FAIL)
        );
    }

    await question.destroy();

    res.status(200).json({
        success: true,
        message: 'تم حذف السؤال بنجاح'
    });
});

export {
    getLessonsBySubject,
    getLessonById,
    getQuestionsByLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    addQuestion,
    updateQuestion,
    deleteQuestion
};
