import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../config/db_config.js';


  const GuidanceCase = sequelize.define('GuidanceCase', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    caseNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      defaultValue: Sequelize.literal(
    `'GC-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('guidance_case_seq')::text, 4, '0')`
  )
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('active', 'monitoring', 'resolved', 'closed', 'referred'),
      defaultValue: 'active'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true
    },
    riskFactors: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    interventionPlan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sessions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    sessionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastSessionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextSessionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    parentInvolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    parentMeetingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referredTo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'guidance_cases',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['caseNumber'] },
      { fields: ['studentId'] },
      { fields: ['type'] },
      { fields: ['priority'] },
      { fields: ['status'] },
      { fields: ['assignedToId'] },
      { fields: ['riskLevel'] }
    ],
  });

  GuidanceCase.associate = (models) => {
    // Belongs to Student
    GuidanceCase.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // Belongs to Teacher/Counselor (assigned to)
    GuidanceCase.belongsTo(models.Teacher, {
      foreignKey: 'assignedToId',
      as: 'assignedTo'
    });

    // Belongs to Teacher (created by)
    GuidanceCase.belongsTo(models.Teacher, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
  };

export default GuidanceCase;