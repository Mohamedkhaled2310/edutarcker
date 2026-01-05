import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import { models } from '../utils/db_instance.js';
import sequelize from '../config/db_config.js';
import { Op } from 'sequelize';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';
import { validateRecordAttendance } from '../models/attendance.js';

const { Attendance, Student, Class } = models;
 


const getAttendance = asyncWrapper(async (req, res, next) => {
    const { date, grade, class: section } = req.query;

    if (!date) return next(appError.create("التاريخ مطلوب للبحث", 400, httpStatusText.FAIL));

    const attendanceRecords = await Attendance.findAll({
        where: { date },
        include: [{
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'studentId'],
            include: [{
                model: Class,
                as: 'class',
                where: (grade || section) ? { 
                    ...(grade && { grade }), 
                    ...(section && { name: section }) 
                } : {}
            }]
        }]
    });

    const formattedData = attendanceRecords
        .filter(record => record.student) 
        .map(record => ({
            id: record.id,
            studentId: record.student.studentId,
            studentName: record.student.name,
            date: record.date,
            status: record.status,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            notes: record.notes || ""
        }));

    res.status(200).json({ success: true, data: formattedData });
});

const recordAttendance = asyncWrapper(async (req, res, next) => {
  const { error, value } = validateRecordAttendance(req.body);
  if (error) return next(appError.create(error.details[0].message, 400, httpStatusText.FAIL));

  const { date, records } = value;

  await sequelize.transaction(async (t) => {
    const students = await Student.findAll({
      where: { studentId: { [Op.in]: records.map(r => r.studentId) } },
      attributes: ['id', 'studentId'], 
      transaction: t
    });

    const idMap = Object.fromEntries(students.map(s => [s.studentId, s.id]));

    await Attendance.destroy({
      where: { date, studentId: { [Op.in]: Object.values(idMap) } },
      transaction: t
    });

    await Attendance.bulkCreate(
      records.map(r => ({
        date,
        studentId: idMap[r.studentId], 
        status: r.status,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        notes: r.notes ?? r.reason ?? null,
        parentNotified: r.parentNotified ?? false,
        notifiedAt: r.parentNotified ? new Date() : null
      })).filter(r => r.studentId),
      { transaction: t }
    );
  });

  const stats = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, { present: 0, absent: 0, late: 0 });

  res.status(201).json({
    success: true,
    message: "تم تسجيل الحضور بنجاح",
    data: { totalRecorded: records.length, ...stats }
  });
});


const getStudentAttendanceHistory = asyncWrapper(async (req, res, next) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = { studentId };
    if (startDate && endDate) {
        whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const records = await Attendance.findAll({
        where: whereClause,
        order: [['date', 'DESC']]
    });

    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    
    const attendanceRate = totalDays > 0 
        ? ((presentCount + lateCount) / totalDays * 100).toFixed(1) 
        : "0.0";

    res.status(200).json({
        success: true,
        data: {
            summary: {
                totalDays,
                present: presentCount,
                absent: records.filter(r => r.status === 'absent').length,
                late: lateCount,
                attendanceRate: parseFloat(attendanceRate)
            },
            records: records.map(r => ({
                date: r.date,
                status: r.status,
                checkInTime: r.checkInTime,
                notes: r.notes || ""
            }))
        }
    });
});

export {getStudentAttendanceHistory,getAttendance,recordAttendance};