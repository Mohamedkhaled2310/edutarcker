import { DataTypes ,Sequelize} from 'sequelize';
import sequelize from '../config/db_config.js';


  const Circular = sequelize.define('Circular', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    circularNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      defaultValue: Sequelize.literal(
        `'CIR-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('circular_seq')::text, 4, '0')`
      )
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    audience: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: ['all']
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'archived', 'expired'),
      defaultValue: 'draft'
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    requiresAcknowledgment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    acknowledgmentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'circulars',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['circularNumber'] },
      { fields: ['priority'] },
      { fields: ['status'] },
      { fields: ['createdById'] },
      { fields: ['publishedAt'] },
      { fields: ['expiresAt'] }
    ],
  });
  Circular.associate = (models) => {
    // Belongs to User (created by)
    Circular.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
  };

export default Circular;