import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Subject, Teacher, Class, Grade } = models;

/**
 * GET /subjects
 */
const getSubjects = asyncWrapper(async (req, res) => {
  const { gradeLevel, status, subjectType } = req.query;

  const whereClause = {
    ...(gradeLevel && { gradeLevel }),
    ...(status && { status }),
    ...(subjectType && { subjectType })
  };

  const subjects = await Subject.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: subjects
  });
});

/**
 * GET /subjects/:id
 */
const getSubjectById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const subject = await Subject.findByPk(id, {
    include: [
      {
        model: Teacher,
        as: 'teachers',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      },
      {
        model: Class,
        as: 'classes',
        attributes: ['id', 'grade', 'name'],
        through: { attributes: [] }
      }
    ]
  });

  if (!subject) {
    return next(
      appError.create('المادة غير موجودة', 404, httpStatusText.FAIL)
    );
  }

  res.status(200).json({
    success: true,
    data: subject
  });
});

/**
 * POST /subjects
 */
const createSubject = asyncWrapper(async (req, res) => {
  const subject = await Subject.create(req.body);

  res.status(201).json({
    success: true,
    message: 'تم إضافة المادة بنجاح',
    data: {
      id: subject.id,
      name: subject.name,
      code: subject.code
    }
  });
});

/**
 * PUT /subjects/:id
 */
const updateSubject = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const subject = await Subject.findByPk(id);
  if (!subject) {
    return next(
      appError.create('المادة غير موجودة', 404, httpStatusText.FAIL)
    );
  }

  await subject.update(req.body);

  res.status(200).json({
    success: true,
    message: 'تم تحديث المادة بنجاح'
  });
});

/**
 * DELETE /subjects/:id
 */
const deleteSubject = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const subject = await Subject.findByPk(id);
  if (!subject) {
    return next(
      appError.create('المادة غير موجودة', 404, httpStatusText.FAIL)
    );
  }

  // 🔒 check if subject has grades
  const gradesCount = await Grade.count({
    where: { subjectId: id }
  });

  if (gradesCount > 0) {
    return next(
      appError.create(
        'لا يمكن حذف المادة لوجود درجات مرتبطة بها',
        400,
        httpStatusText.FAIL
      )
    );
  }

  await subject.destroy();

  res.status(200).json({
    success: true,
    message: 'تم حذف المادة بنجاح'
  });
});

export {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
