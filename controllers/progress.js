import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { StudentProgress, StudentAnswer, Lesson, Question, Student } = models;

/**
 * POST /api/progress/video
 * Update video watch progress
 */
const updateVideoProgress = asyncWrapper(async (req, res, next) => {
    const { lessonId, videoProgress, videoWatched } = req.body;
    const studentId = req.user.studentId || req.user.id; // Assuming user has studentId

    // Verify lesson exists
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
        return next(
            appError.create('الدرس غير موجود', 404, httpStatusText.FAIL)
        );
    }

    // Find or create progress record
    let progress = await StudentProgress.findOne({
        where: { studentId, lessonId }
    });

    if (!progress) {
        progress = await StudentProgress.create({
            studentId,
            lessonId,
            videoProgress: videoProgress || 0,
            videoWatched: videoWatched || false
        });
    } else {
        await progress.update({
            videoProgress: videoProgress || progress.videoProgress,
            videoWatched: videoWatched !== undefined ? videoWatched : progress.videoWatched
        });
    }

    res.status(200).json({
        success: true,
        message: 'تم تحديث تقدم الفيديو',
        data: progress
    });
});

/**
 * POST /api/progress/answer
 * Submit an answer to a question
 */
const submitAnswer = asyncWrapper(async (req, res, next) => {
    const { questionId, studentAnswer, timeSpent, hintsUsed } = req.body;
    const studentId = req.user.studentId || req.user.id;

    // Get question with correct answer
    const question = await Question.findByPk(questionId, {
        include: [{
            model: Lesson,
            as: 'lesson',
            attributes: ['id']
        }]
    });

    if (!question) {
        return next(
            appError.create('السؤال غير موجود', 404, httpStatusText.FAIL)
        );
    }

    // Check if answer is correct
    let isCorrect = false;
    if (question.questionType === 'true_false') {
        isCorrect = studentAnswer === question.correctAnswer;
    } else if (question.questionType === 'multiple_choice') {
        // correctAnswer could be index or value
        isCorrect = studentAnswer === question.correctAnswer ||
            studentAnswer === question.correctAnswer.value ||
            studentAnswer === question.correctAnswer.index;
    }

    // Count previous attempts
    const attemptCount = await StudentAnswer.count({
        where: { studentId, questionId }
    });

    // Save answer
    const answer = await StudentAnswer.create({
        studentId,
        questionId,
        studentAnswer,
        isCorrect,
        attemptNumber: attemptCount + 1,
        timeSpent: timeSpent || 0,
        hintsUsed: hintsUsed || 0
    });

    // Update progress
    const lessonId = question.lesson.id;
    let progress = await StudentProgress.findOne({
        where: { studentId, lessonId }
    });

    if (!progress) {
        progress = await StudentProgress.create({
            studentId,
            lessonId,
            questionsAttempted: 1,
            questionsCorrect: isCorrect ? 1 : 0
        });
    } else {
        // Only count as new attempt if this is first attempt on this question
        if (attemptCount === 0) {
            await progress.update({
                questionsAttempted: progress.questionsAttempted + 1,
                questionsCorrect: progress.questionsCorrect + (isCorrect ? 1 : 0)
            });
        }
    }

    res.status(200).json({
        success: true,
        message: isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة',
        data: {
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            explanationEn: question.explanationEn,
            points: isCorrect ? question.points : 0
        }
    });
});

/**
 * GET /api/progress/student/:studentId
 * Get overall progress for a student
 */
const getStudentProgress = asyncWrapper(async (req, res, next) => {
    const { studentId } = req.params;

    // Verify student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
        return next(
            appError.create('الطالب غير موجود', 404, httpStatusText.FAIL)
        );
    }

    const progress = await StudentProgress.findAll({
        where: { studentId },
        include: [
            {
                model: Lesson,
                as: 'lesson',
                attributes: ['id', 'title', 'titleEn', 'videoDuration'],
                include: [{
                    model: models.Subject,
                    as: 'subject',
                    attributes: ['id', 'name', 'code']
                }]
            }
        ],
        order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: progress
    });
});

/**
 * GET /api/progress/lesson/:lessonId
 * Get progress for a specific lesson (current student)
 */
const getLessonProgress = asyncWrapper(async (req, res, next) => {
    const { lessonId } = req.params;
    const studentId = req.user.studentId || req.user.id;

    const progress = await StudentProgress.findOne({
        where: { studentId, lessonId },
        include: [
            {
                model: Lesson,
                as: 'lesson',
                attributes: ['id', 'title', 'titleEn', 'videoDuration']
            }
        ]
    });

    // Get answered questions
    const answeredQuestions = await StudentAnswer.findAll({
        where: { studentId },
        include: [{
            model: Question,
            as: 'question',
            where: { lessonId },
            attributes: ['id', 'questionText', 'level', 'points']
        }]
    });

    res.status(200).json({
        success: true,
        data: {
            progress: progress || null,
            answeredQuestions
        }
    });
});

/**
 * POST /api/progress/complete
 * Mark a lesson as completed
 */
const completeLesson = asyncWrapper(async (req, res, next) => {
    const { lessonId, selectedLevel } = req.body;
    const studentId = req.user.studentId || req.user.id;

    const progress = await StudentProgress.findOne({
        where: { studentId, lessonId }
    });

    if (!progress) {
        return next(
            appError.create('لم يتم العثور على تقدم في هذا الدرس', 404, httpStatusText.FAIL)
        );
    }

    // Calculate score
    const score = progress.questionsAttempted > 0
        ? (progress.questionsCorrect / progress.questionsAttempted) * 100
        : 0;

    await progress.update({
        completedAt: new Date(),
        selectedLevel: selectedLevel || progress.selectedLevel,
        score: score.toFixed(2)
    });

    res.status(200).json({
        success: true,
        message: 'تم إكمال الدرس بنجاح!',
        data: {
            score: score.toFixed(2),
            questionsCorrect: progress.questionsCorrect,
            questionsAttempted: progress.questionsAttempted
        }
    });
});

/**
 * GET /api/progress/stats/:studentId
 * Get overall learning statistics for a student
 */
const getStudentStats = asyncWrapper(async (req, res, next) => {
    const { studentId } = req.params;

    const allProgress = await StudentProgress.findAll({
        where: { studentId }
    });

    const completedLessons = allProgress.filter(p => p.completedAt).length;
    const totalLessons = allProgress.length;
    const averageScore = allProgress.length > 0
        ? allProgress.reduce((sum, p) => sum + parseFloat(p.score), 0) / allProgress.length
        : 0;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

    res.status(200).json({
        success: true,
        data: {
            completedLessons,
            totalLessons,
            averageScore: averageScore.toFixed(2),
            totalTimeSpent,
            completionRate: totalLessons > 0 ? ((completedLessons / totalLessons) * 100).toFixed(2) : 0
        }
    });
});

export {
    updateVideoProgress,
    submitAnswer,
    getStudentProgress,
    getLessonProgress,
    completeLesson,
    getStudentStats
};
