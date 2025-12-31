import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';


  const Communication = sequelize.define('Communication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'parents',
        key: 'id'
      }
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('sms', 'email', 'phone', 'in_person', 'app_notification'),
      allowNull: false,
      defaultValue: 'sms'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    templateId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sentById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'read'),
      defaultValue: 'pending'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    requiresResponse: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    responseReceived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responseAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'communications',
    timestamps: true,
    indexes: [
      { fields: ['parentId'] },
      { fields: ['studentId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['sentById'] },
      { fields: ['sentAt'] },
      { fields: ['priority'] }
    ]
  });

  Communication.associate = (models) => {
    // Belongs to Parent
    Communication.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // Belongs to Student (optional)
    Communication.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // Belongs to Teacher (who sent it)
    Communication.belongsTo(models.Teacher, {
      foreignKey: 'sentById',
      as: 'sentBy'
    });
  };

export default Communication;