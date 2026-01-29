import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

const StudentProgress = sequelize.define('StudentProgress', {
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
        },
        onDelete: 'CASCADE'
    },
    lessonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    videoWatched: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    videoProgress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Seconds watched in the video'
    },
    questionsAttempted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    questionsCorrect: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    selectedLevel: {
        type: DataTypes.ENUM('high', 'medium', 'special_needs'),
        allowNull: true,
        comment: 'The difficulty level selected by student'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Overall lesson score as percentage'
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total time spent on lesson in seconds'
    }
}, {
    tableName: 'student_progress',
    timestamps: true,
    indexes: [
        { fields: ['studentId'] },
        { fields: ['lessonId'] },
        { fields: ['completedAt'] },
        {
            unique: true,
            fields: ['studentId', 'lessonId'],
            name: 'unique_student_lesson'
        }
    ]
});

StudentProgress.associate = (models) => {
    // Belongs to Student
    StudentProgress.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    // Belongs to Lesson
    StudentProgress.belongsTo(models.Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });
};

export default StudentProgress;
