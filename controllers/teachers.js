import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Teacher, Subject, Class } = models;

/**
 * GET /teachers
 */
const getTeachers = asyncWrapper(async (req, res) => {
  const { department, status } = req.query;

  const whereClause = {
    ...(department && { department }),
    ...(status && { status })
  };

  const teachers = await Teacher.findAll({
    where: whereClause,
    include: [
      {
        model: Subject,
        as: 'subjects',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      },
      {
        model: Class,
        as: 'classes',
        attributes: ['id', 'grade', 'name'],
        through: { attributes: [] }
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const formatted = teachers.map(t => ({
    id: t.id,
    name: t.name,
    employeeId: t.employeeId,
    department: t.department,
    subjects: t.subjects.map(s => s.name),
    grades: [...new Set(t.classes.map(c => c.grade))],
    phone: t.phone,
    email: t.email,
    avatar: t.avatar?.secure_url,
    status: t.status,
    joinDate: t.joinDate
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });
});

/**
 * GET /teachers/:id
 */
const getTeacherById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const teacher = await Teacher.findByPk(id, {
    include: [
      {
        model: Subject,
        as: 'subjects',
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

  if (!teacher) {
    return next(
      appError.create('المعلم غير موجود', 404, httpStatusText.FAIL)
    );
  }

  res.status(200).json({
    success: true,
    data: {
      id: teacher.id,
      name: teacher.name,
      employeeId: teacher.employeeId,
      department: teacher.department,
      phone: teacher.phone,
      email: teacher.email,
      avatar: teacher.avatar,
      status: teacher.status,
      joinDate: teacher.joinDate,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      subjects: teacher.subjects,
      classes: teacher.classes
    }
  });
});

/**
 * POST /teachers
 */
const createTeacher = asyncWrapper(async (req, res) => {
  const { subjects, classes, ...teacherData } = req.body;

  const teacher = await Teacher.create(teacherData);

  if (subjects?.length) {
    await teacher.setSubjects(subjects);
  }

  if (classes?.length) {
    await teacher.setClasses(classes);
  }

  res.status(201).json({
    success: true,
    message: 'تم إضافة المعلم بنجاح',
    data: {
      id: teacher.id,
      employeeId: teacher.employeeId
    }
  });
});

/**
 * PUT /teachers/:id
 */
const updateTeacher = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return next(
      appError.create('المعلم غير موجود', 404, httpStatusText.FAIL)
    );
  }

  const { subjects, classes, ...updateData } = req.body;

  await teacher.update(updateData);

  if (subjects) await teacher.setSubjects(subjects);
  if (classes) await teacher.setClasses(classes);

  res.status(200).json({
    success: true,
    message: 'تم تحديث بيانات المعلم بنجاح'
  });
});

export {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher
};
