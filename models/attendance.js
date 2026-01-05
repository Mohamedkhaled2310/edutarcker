import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';
import Joi from 'joi';

  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
      allowNull: false,
      defaultValue: 'present'
    },
    checkInTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    checkOutTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recordedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    parentNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'attendance',
    timestamps: true,
    indexes: [
      { fields: ['studentId'] },
      { fields: ['date'] },
      { fields: ['status'] },
      { unique: true, fields: ['studentId', 'date'] }
    ]
  });

  Attendance.associate = (models) => {
    // Belongs to Student
    Attendance.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // Belongs to Teacher (who recorded it)
    Attendance.belongsTo(models.Teacher, {
      foreignKey: 'recordedById',
      as: 'recordedBy'
    });
  };
export const validateRecordAttendance = (obj) => {
    const schema = Joi.object({
        date: Joi.date().iso().required().messages({
            'date.format': 'تنسيق التاريخ غير صحيح، يجب أن يكون YYYY-MM-DD'
        }),
records: Joi.array().items(
            Joi.object({
                studentId: Joi.string().required(),
                status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
                checkInTime: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional(),
                checkOutTime: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional(),
                reason: Joi.string().allow('').optional(),
                notes: Joi.string().allow('').optional(),
                parentNotified: Joi.boolean().optional().default(false)
            })
        ).min(1).required().messages({
            'array.min': 'يجب إرسال سجل حضور واحد على الأقل'
        })
    });
    return schema.validate(obj);
}          

export default Attendance;
