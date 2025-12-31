import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';


  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    classTeacherId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true
    },
    schedule: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'classes',
    timestamps: true,
    indexes: [
      { fields: ['grade'] },
      { fields: ['academicYear'] },
      { fields: ['status'] },
      { unique: true, fields: ['grade', 'section', 'academicYear'] }
    ]
  });

  Class.associate = (models) => {
    // Belongs to a Class Teacher
    Class.belongsTo(models.Teacher, {
      foreignKey: 'classTeacherId',
      as: 'classTeacher'
    });

    // Has many Students
    Class.hasMany(models.Student, {
      foreignKey: 'classId',
      as: 'students'
    });

    // Many-to-Many with Teachers
    Class.belongsToMany(models.Teacher, {
      through: 'teacher_classes',
      foreignKey: 'classId',
      otherKey: 'teacherId',
      as: 'teachers'
    });

    // Many-to-Many with Subjects
    Class.belongsToMany(models.Subject, {
      through: 'class_subjects',
      foreignKey: 'classId',
      otherKey: 'subjectId',
      as: 'subjects'
    });
  };

export default Class;