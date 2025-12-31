import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';


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

export default Attendance;