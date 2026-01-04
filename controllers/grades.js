import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';
import { Op } from 'sequelize';

const { Grade, Student, Subject, Teacher } = models;

/**
 * GET /grades/student/:studentId
 */
const getStudentGrades = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;
  const { semester, year } = req.query;

  const student = await Student.findByPk(studentId);
  if (!student) return next(appError.create('الطالب غير موجود', 404, httpStatusText.FAIL));

  const whereClause = { studentId };
  if (semester) whereClause.semester = semester;
  if (year) whereClause.academicYear = year;

  const grades = await Grade.findAll({
    where: whereClause,
    include: [{ model: Subject, as: 'subject', attributes: ['name'] }],
    order: [['createdAt', 'ASC']]
  });

  const subjects = grades.map(g => {
    const total = parseFloat(g.homework) + parseFloat(g.participation) + parseFloat(g.midterm) + parseFloat(g.final);
    const percentage = Math.round((total / 200) * 100); // example scale
    const letterGrade = percentage >= 90 ? 'ممتاز' :
                        percentage >= 80 ? 'جيد جداً' :
                        percentage >= 70 ? 'جيد' :
                        percentage >= 60 ? 'مقبول' : 'ضعيف';

    return {
      name: g.subject.name,
      homework: parseFloat(g.homework),
      participation: parseFloat(g.participation),
      midterm: parseFloat(g.midterm),
      final: parseFloat(g.final),
      total,
      percentage,
      grade: letterGrade
    };
  });

  const totalPercentage = subjects.length
    ? Math.round(subjects.reduce((acc, s) => acc + s.percentage, 0) / subjects.length)
    : 0;

  // Example rank & GPA (hardcoded for demo)
  const summary = {
    totalPercentage,
    rank: 5,
    totalStudents: 30,
    gpa: (totalPercentage / 25).toFixed(1)
  };

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        class: student.class
      },
      semester: semester ? parseInt(semester) : null,
      year: year || null,
      subjects,
      summary
    }
  });
});

/**
 * POST /grades
 */
const recordGrade = asyncWrapper(async (req, res) => {
  const { studentId, subjectId, semester, type, score, maxScore } = req.body;

  const grade = await Grade.findOne({
    where: { studentId, subjectId, semester, academicYear: req.body.year }
  });

  if (grade) {
    // Update score type
    await grade.update({ [type]: score });
  } else {
    await Grade.create({
      studentId,
      subjectId,
      semester,
      academicYear: req.body.year,
      [type]: score,
      recordedById: req.user.id
    });
  }

  res.status(201).json({
    success: true,
    message: 'تم تسجيل/تحديث الدرجة بنجاح'
  });
});

/**
 * PUT /grades/:id
 */
/**
 * PUT /grades
 */
const updateGrade = asyncWrapper(async (req, res, next) => {
  const { studentId, subjectId, semester, year, type, score } = req.body;

  const grade = await Grade.findOne({
    where: {
      studentId,
      subjectId,
      semester,
      academicYear: year
    }
  });

  if (!grade) {
    return next(
      appError.create('الدرجة غير موجودة', 404, httpStatusText.FAIL)
    );
  }

  await grade.update({
    [type]: score,
    recordedById: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'تم تحديث الدرجة بنجاح'
  });
});


/**
 * DELETE /grades/:id
 */
/**
 * DELETE /grades
 */
const deleteGrade = asyncWrapper(async (req, res, next) => {
  const { studentId, subjectId, semester, year } = req.body;

  const grade = await Grade.findOne({
    where: {
      studentId,
      subjectId,
      semester,
      academicYear: year
    }
  });

  if (!grade) {
    return next(
      appError.create('الدرجة غير موجودة', 404, httpStatusText.FAIL)
    );
  }

  await grade.destroy();

  res.status(200).json({
    success: true,
    message: 'تم حذف الدرجة بنجاح'
  });
});


export { getStudentGrades, recordGrade, updateGrade, deleteGrade };
