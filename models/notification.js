import { DataTypes } from 'sequelize';

import sequelize from '../config/db_config.js';

  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionLabel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dismissed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dismissedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['read'] },
      { fields: ['priority'] },
      { fields: ['createdAt'] },
      { fields: ['expiresAt'] }
    ]
  });

  Notification.associate = (models) => {
    // Belongs to User
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

export default Notification;