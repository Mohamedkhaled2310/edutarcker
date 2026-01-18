import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';

const { Teacher, Subject, Class, TeacherSupportRecord, Student, Grade } = models;

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
    where: {
      ...whereClause,
      status: 'active'
    },
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

/**
 * POST /teachers/:id/support-records
 */
const createSupportRecord = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { visitDate, supportPlan, training, notes } = req.body;

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return next(
      appError.create('المعلم غير موجود', 404, httpStatusText.FAIL)
    );
  }

  const supportRecord = await TeacherSupportRecord.create({
    teacherId: id,
    visitDate,
    supportPlan,
    training,
    notes,
    createdById: req.user?.id
  });

  res.status(201).json({
    success: true,
    message: 'تم إضافة سجل الدعم بنجاح',
    data: supportRecord
  });
});

/**
 * GET /teachers/:id/support-records
 */
const getTeacherSupportRecords = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return next(
      appError.create('المعلم غير موجود', 404, httpStatusText.FAIL)
    );
  }

  const supportRecords = await TeacherSupportRecord.findAll({
    where: { teacherId: id },
    order: [['visitDate', 'DESC']],
    include: [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'name']
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: supportRecords
  });
});

/**
 * GET /teachers/statistics/overview
 */
const getTeacherStatistics = asyncWrapper(async (req, res) => {
  // Calculate average student improvement
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  // Get all grades for current academic year
  const grades = await Grade.findAll({
    where: { academicYear },
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'name']
      },
      {
        model: Subject,
        as: 'subject',
        attributes: ['id', 'name', 'passingGrade']
      }
    ]
  });

  // Calculate average improvement (comparing semester 1 to semester 2)
  const semester1Grades = grades.filter(g => g.semester === 1);
  const semester2Grades = grades.filter(g => g.semester === 2);

  let totalImprovement = 0;
  let improvementCount = 0;

  semester1Grades.forEach(s1Grade => {
    const s2Grade = semester2Grades.find(
      g => g.studentId === s1Grade.studentId && g.subjectId === s1Grade.subjectId
    );
    if (s2Grade) {
      totalImprovement += (parseFloat(s2Grade.percentage) - parseFloat(s1Grade.percentage));
      improvementCount++;
    }
  });

  const averageStudentImprovement = improvementCount > 0
    ? (totalImprovement / improvementCount).toFixed(2)
    : 0;

  // Find subjects needing support (below passing grade average)
  const subjectPerformance = {};
  grades.forEach(grade => {
    const subjectName = grade.subject.name;
    const passingGrade = grade.subject.passingGrade;

    if (!subjectPerformance[subjectName]) {
      subjectPerformance[subjectName] = {
        name: subjectName,
        totalPercentage: 0,
        count: 0,
        passingGrade
      };
    }

    subjectPerformance[subjectName].totalPercentage += parseFloat(grade.percentage);
    subjectPerformance[subjectName].count++;
  });

  const subjectsNeedingSupport = Object.values(subjectPerformance)
    .map(subject => ({
      name: subject.name,
      averageGrade: (subject.totalPercentage / subject.count).toFixed(2),
      teacherCount: 0 // Will be populated if we track teacher-subject relationships
    }))
    .filter(subject => parseFloat(subject.averageGrade) < 60)
    .sort((a, b) => parseFloat(a.averageGrade) - parseFloat(b.averageGrade))
    .slice(0, 5);

  // Find teachers requiring support (with support records or low class performance)
  const teachers = await Teacher.findAll({
    where: { status: 'active' },
    include: [
      {
        model: TeacherSupportRecord,
        as: 'supportRecords',
        attributes: ['id']
      },
      {
        model: Class,
        as: 'classes',
        attributes: ['id', 'grade', 'name']
      }
    ]
  });

  const teachersRequiringSupport = teachers
    .map(teacher => {
      const supportRecordCount = teacher.supportRecords?.length || 0;

      return {
        id: teacher.id,
        name: teacher.name,
        department: teacher.department,
        supportRecordCount,
        averageClassPerformance: 0 // Placeholder - would need class performance calculation
      };
    })
    .filter(teacher => teacher.supportRecordCount > 0)
    .sort((a, b) => b.supportRecordCount - a.supportRecordCount)
    .slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      averageStudentImprovement: parseFloat(averageStudentImprovement),
      subjectsNeedingSupport,
      teachersRequiringSupport
    }
  });
});

export {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  createSupportRecord,
  getTeacherSupportRecords,
  getTeacherStatistics
};
