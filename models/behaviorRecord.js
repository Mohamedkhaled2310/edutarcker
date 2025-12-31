import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';


  const BehaviorRecord = sequelize.define('BehaviorRecord', {
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
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('positive', 'violation'),
      allowNull: false,
      defaultValue: 'violation'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reportedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'resolved', 'escalated'),
      defaultValue: 'pending'
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Positive points for good behavior, negative for violations'
    },
    parentNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'behavior_records',
    timestamps: true,
    indexes: [
      { fields: ['studentId'] },
      { fields: ['category'] },
      { fields: ['severity'] },
      { fields: ['status'] },
      { fields: ['date'] },
      { fields: ['reportedById'] }
    ]
  });

  BehaviorRecord.associate = (models) => {
    // Belongs to Student
    BehaviorRecord.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // Belongs to Teacher (who reported it)
    BehaviorRecord.belongsTo(models.Teacher, {
      foreignKey: 'reportedById',
      as: 'reportedBy'
    });
  };
export default BehaviorRecord;