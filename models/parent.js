import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

  const Parent = sequelize.define('Parent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fatherName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fatherPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fatherEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    fatherOccupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    motherName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    motherPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    motherEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    motherOccupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    primaryContact: {
      type: DataTypes.ENUM('father', 'mother', 'both'),
      defaultValue: 'father'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationalId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'parents',
    timestamps: true,
    indexes: [
      { fields: ['fatherPhone'] },
      { fields: ['motherPhone'] },
      { fields: ['fatherEmail'] },
      { fields: ['motherEmail'] }
    ]
  });

  Parent.associate = (models) => {
    // Belongs to User
    Parent.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Many-to-Many with Students
    Parent.belongsToMany(models.Student, {
      through: 'student_parents',
      foreignKey: 'parentId',
      otherKey: 'studentId',
      as: 'children'
    });

    // Has many Communications
    Parent.hasMany(models.Communication, {
      foreignKey: 'parentId',
      as: 'communications'
    });
  };
export default Parent;