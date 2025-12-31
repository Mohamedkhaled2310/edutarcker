import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';


  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gradeLevel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creditHours: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    passingGrade: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 50.00
    },
    maxScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    weightage: {
      type: DataTypes.JSONB,
      defaultValue: {
        homework: 10,
        participation: 10,
        midterm: 30,
        final: 50
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'subjects',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['gradeLevel'] },
      { fields: ['status'] }
    ]
  });

  Subject.associate = (models) => {
    // Many-to-Many with Teachers
    Subject.belongsToMany(models.Teacher, {
      through: 'teacher_subjects',
      foreignKey: 'subjectId',
      otherKey: 'teacherId',
      as: 'teachers'
    });

    // Many-to-Many with Classes
    Subject.belongsToMany(models.Class, {
      through: 'class_subjects',
      foreignKey: 'subjectId',
      otherKey: 'classId',
      as: 'classes'
    });

    // Has many Grades
    Subject.hasMany(models.Grade, {
      foreignKey: 'subjectId',
      as: 'grades'
    });
  };

export default Subject;