import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

const StudentAnswer = sequelize.define('StudentAnswer', {
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
    questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    studentAnswer: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Student submitted answer'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Time spent on this question in seconds'
    },
    hintsUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'student_answers',
    timestamps: true,
    indexes: [
        { fields: ['studentId'] },
        { fields: ['questionId'] },
        { fields: ['isCorrect'] },
        { fields: ['studentId', 'questionId'] }
    ]
});

StudentAnswer.associate = (models) => {
    // Belongs to Student
    StudentAnswer.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    // Belongs to Question
    StudentAnswer.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question'
    });
};

export default StudentAnswer;
