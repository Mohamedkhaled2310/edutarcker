import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

  const Grade = sequelize.define('Grade', {
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
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 2
      }
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false
    },
    homework: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 20
      }
    },
    participation: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10
      }
    },
    midterm: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 50
      }
    },
    final: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    total: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    letterGrade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gradePoint: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    comments: {
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
    }
  }, {
    tableName: 'grades',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['studentId', 'subjectId', 'semester', 'academicYear'] }
    ],
  });

  Grade.associate = (models) => {
    // Belongs to Student
    Grade.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // Belongs to Subject
    Grade.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });

    // Belongs to Teacher (who recorded it)
    Grade.belongsTo(models.Teacher, {
      foreignKey: 'recordedById',
      as: 'recordedBy'
    });
  };
export default Grade;