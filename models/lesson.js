import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

const Lesson = sequelize.define('Lesson', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    titleEn: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    descriptionEn: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    videoDuration: {
        type: DataTypes.INTEGER, // Duration in seconds
        allowNull: false,
        defaultValue: 0
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    objectives: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: 'Array of learning objectives in Arabic and English'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'lessons',
    timestamps: true,
    indexes: [
        { fields: ['subjectId'] },
        { fields: ['status'] },
        { fields: ['orderIndex'] }
    ]
});

Lesson.associate = (models) => {
    // Belongs to Subject
    Lesson.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject'
    });

    // Has many Questions
    Lesson.hasMany(models.Question, {
        foreignKey: 'lessonId',
        as: 'questions',
        onDelete: 'CASCADE'
    });

    // Has many StudentProgress records
    Lesson.hasMany(models.StudentProgress, {
        foreignKey: 'lessonId',
        as: 'studentProgress',
        onDelete: 'CASCADE'
    });
};

export default Lesson;
