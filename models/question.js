import { DataTypes } from 'sequelize';
import sequelize from '../config/db_config.js';

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Question text in Arabic'
    },
    questionTextEn: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Question text in English'
    },
    questionType: {
        type: DataTypes.ENUM('multiple_choice', 'true_false'),
        allowNull: false,
        defaultValue: 'multiple_choice'
    },
    level: {
        type: DataTypes.ENUM('high', 'medium', 'special_needs'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'مستوى عالي، متوسط، ذوي الهمم'
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array of answer options for multiple choice questions with Arabic and English text'
    },
    correctAnswer: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Correct answer (string for true/false, index or value for multiple choice)'
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Explanation in Arabic'
    },
    explanationEn: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Explanation in English'
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hints: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of hints for special needs level (bilingual)'
    }
}, {
    tableName: 'questions',
    timestamps: true,
    indexes: [
        { fields: ['lessonId'] },
        { fields: ['level'] },
        { fields: ['questionType'] },
        { fields: ['orderIndex'] }
    ]
});

Question.associate = (models) => {
    // Belongs to Lesson
    Question.belongsTo(models.Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // Has many StudentAnswers
    Question.hasMany(models.StudentAnswer, {
        foreignKey: 'questionId',
        as: 'studentAnswers',
        onDelete: 'CASCADE'
    });
};

export default Question;
