import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../config/db_config.js';

const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        reportNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: Sequelize.literal(
                `'REP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('report_seq')::text, 4, '0')`
            )
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'semester', 'annual', 'custom'),
            allowNull: false,
            defaultValue: 'weekly'
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        grade: {
            type: DataTypes.STRING,
            allowNull: true
        },
        classId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'classes',
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
        status: {
            type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'published'),
            defaultValue: 'draft'
        },
        periodStart: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        periodEnd: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        summary: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        data: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        statistics: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        approvedById: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        attachments: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        viewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        downloadCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'reports',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['reportNumber'] },
            { fields: ['type'] },
            { fields: ['status'] },
            { fields: ['grade'] },
            { fields: ['classId'] },
            { fields: ['createdById'] },
            { fields: ['periodStart'] },
            { fields: ['periodEnd'] }
        ],
    });

    Report.associate = (models) => {
        // Belongs to Class (optional)
        Report.belongsTo(models.Class, {
            foreignKey: 'classId',
            as: 'class'
        });

        // Belongs to Teacher (created by)
        Report.belongsTo(models.Teacher, {
            foreignKey: 'createdById',
            as: 'createdBy'
        });

        // Belongs to User (approved by)
        Report.belongsTo(models.User, {
            foreignKey: 'approvedById',
            as: 'approvedBy'
        });
    };

export default Report;