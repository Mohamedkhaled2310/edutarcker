import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

const TeacherSupportRecord = sequelize.define('TeacherSupportRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'teachers',
            key: 'id'
        }
    },
    visitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    supportPlan: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    training: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdById: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'teacher_support_records',
    timestamps: true,
    indexes: [
        { fields: ['teacherId'] },
        { fields: ['visitDate'] }
    ]
});

TeacherSupportRecord.associate = (models) => {
    // Belongs to Teacher
    TeacherSupportRecord.belongsTo(models.Teacher, {
        foreignKey: 'teacherId',
        as: 'teacher'
    });

    // Belongs to User (who created the record)
    TeacherSupportRecord.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdBy'
    });
};

export default TeacherSupportRecord;
