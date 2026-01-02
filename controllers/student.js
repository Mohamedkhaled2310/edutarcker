import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import { Op } from 'sequelize';
import { validateCreateStudent, validateUpdateStudent } from '../models/student.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';
const { Student, Class, Parent } = models;
import sequelize from '../utils/db_instance.js';
/**
 * @desc    Get all students with pagination and filters
 * @route   GET /api/students
 */
const getAllStudents = asyncWrapper(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const studentFilter = {};
    const classFilter = {};
    studentFilter.status = req.query.status || 'active';
    if (req.query.search) {
        studentFilter.name = { [Op.iLike]: `%${req.query.search}%` };
    }
    if (req.query.grade) {
        classFilter.grade = req.query.grade;
    }

    const totalStudents = await Student.count({
        where: studentFilter,
        include: [{
            model: Class,
            as: 'class',
            where: Object.keys(classFilter).length > 0 ? classFilter : null
        }]
    });

    const totalPages = Math.ceil(totalStudents / limit);

    if (page > totalPages && totalPages > 0) {
        return next(
            appError.create(
                `الصفحة رقم ${page} غير موجودة. إجمالي الصفحات المتاحة: ${totalPages}`,
                404,
                httpStatusText.FAIL
            )
        );
    }

    const students = await Student.findAll({
        where: studentFilter,
        limit,
        offset: skip,
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: Class,
                as: 'class',
                where: Object.keys(classFilter).length > 0 ? classFilter : null,
                attributes: ['name', 'grade']
            },
            {
                model: Parent,
                as: 'parents',
                attributes: ['fatherPhone'],
                through: { attributes: [] }
            }
        ]
    });

    const formattedStudents = students.map(s => ({
        id: s.id,
        name: s.name,
        studentId: s.studentId,
        grade: s.class?.grade || 'غير محدد',
        class: s.class?.name || 'غير محدد',
        avatar: s.avatar?.secure_url,
        status: s.status,
        attendanceRate: parseFloat(s.attendanceRate) || 0,
        behaviorScore: s.behaviorScore,
        parentPhone: s.parents?.[0]?.fatherPhone || 'غير مسجل',
        createdAt: s.createdAt
    }));

    res.status(200).json({
        success: true,
        data: {
            students: formattedStudents,
            pagination: {
                total: totalStudents,
                page: page,
                limit: limit,
                totalPages: totalPages
            }
        }
    });
})
/**
 * @desc    Get single student details
 * @route   GET /api/students/:id
 */
const getStudentById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return next(appError.create("معرف الطالب مطلوب", 400, httpStatusText.FAIL));
    }
    const student = await Student.findByPk(id, {
        include: [
            {
                model: Class,
                as: 'class',
                attributes: ['name', 'grade']
            },
            {
                model: Parent,
                as: 'parents',
                through: { attributes: [] }
            }
        ]
    });

    if (!student) {
        return next(
            appError.create(
                `لا يوجد طالب مسجل بهذا الـ : ${id}`,
                404,
                httpStatusText.FAIL
            )
        );
    }


    const mainParent = student.parents?.[0] || {};

    res.status(200).json({
        success: true,
        data: {
            id: student.id,
            name: student.name,
            studentId: student.studentId,
            grade: student.class?.grade,
            class: student.class?.name,
            avatar: student.avatar?.secure_url,
            dateOfBirth: student.dateOfBirth,
            nationality: student.nationality,
            address: student.address,
            enrollmentDate: student.enrollmentDate,
            status: student.status,
            parent: {
                fatherName: mainParent.fatherName,
                fatherPhone: mainParent.fatherPhone,
                motherName: mainParent.motherName,
                motherPhone: mainParent.motherPhone,
                email: mainParent.fatherEmail || mainParent.motherEmail
            },
            medical: {
                bloodType: student.medicalInfo?.bloodType,
                allergies: student.medicalInfo?.allergies || [],
                conditions: student.medicalInfo?.conditions || []
            }
        }
    });
});
/**
 * @desc    Create new student with Transaction
 * @route   POST /api/students/create-student
 * @access  Admin
 */
const createStudent = asyncWrapper(async (req, res, next) => {
    const { error } = validateCreateStudent(req.body);
    if (error) return next(appError.create(error.details[0].message, 400, httpStatusText.FAIL));

    const {
        name, grade, class: section, dateOfBirth, nationality, address, academicYear,
        parentPhone, parentEmail, bloodType, allergies = [], conditions = []
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const targetClass = await Class.findOne({ where: { grade, section, academicYear }, transaction });
        if (!targetClass) {
            await transaction.rollback();
            return next(appError.create("الفصل الدراسي غير موجود", 404, httpStatusText.FAIL));
        }

        const [parent] = await Parent.findOrCreate({
            where: { fatherPhone: parentPhone },
            defaults: { fatherEmail: parentEmail, fatherName: `والد ${name}` },
            transaction
        });

        const newStudent = await Student.create({
            name, dateOfBirth, nationality, address,
            classId: targetClass.id,
            medicalInfo: { bloodType, allergies, conditions }
        }, { transaction });

        await newStudent.addParents(parent, { transaction });

        await transaction.commit();
        res.status(201).json({
            success: true,
            message: "تم إضافة الطالب بنجاح",
            data: { id: newStudent.id, studentId: newStudent.studentId }
        });
    } catch (err) {
        await transaction.rollback();
        return next(appError.create(err.message, 500, httpStatusText.ERROR));
    }
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 */
const updateStudent = asyncWrapper(async (req, res, next) => {
    const { error } = validateUpdateStudent(req.body);
    if (error) return next(appError.create(error.details[0].message, 400, httpStatusText.FAIL));

    const student = await Student.findByPk(req.params.id);
    if (!student) return next(appError.create("الطالب غير موجود", 404, httpStatusText.FAIL));
    const updatedMedical = {
        ...student.medicalInfo,
        ...(req.body.bloodType && { bloodType: req.body.bloodType }),
        ...(req.body.allergies && { allergies: req.body.allergies }),
        ...(req.body.conditions && { conditions: req.body.conditions })
    };

    await student.update({
        ...req.body,
        medicalInfo: updatedMedical
    });

    res.status(200).json({ success: true, message: "تم التحديث بنجاح" });
});

/**
* 
* @access Admin
* @desc     Delete (Archive) student
* @route    DELETE /api/students/:id 
*/
const deleteStudent = asyncWrapper(async (req, res, next) => {
    const student = await Student.findByPk(req.params.id);
    if (!student) return next(appError.create("الطالب غير موجود", 404, httpStatusText.FAIL));

    await student.update({ status: 'inactive' });
    res.status(200).json({ success: true, message: "تم أرشفة الطالب بنجاح" });
});

export { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent }