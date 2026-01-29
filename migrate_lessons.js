import sequelize from './config/db_config.js';
import Lesson from './models/lesson.js';
import Question from './models/question.js';
import StudentProgress from './models/studentProgress.js';
import StudentAnswer from './models/studentAnswer.js';

async function migrateLessonTables() {
    try {
        console.log('Starting migration for lesson-related tables...');

        // Create lessons table
        await sequelize.getQueryInterface().createTable('lessons', {
            id: {
                type: sequelize.Sequelize.UUID,
                defaultValue: sequelize.Sequelize.UUIDV4,
                primaryKey: true
            },
            subjectId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'subjects',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            title: {
                type: sequelize.Sequelize.STRING,
                allowNull: false
            },
            titleEn: {
                type: sequelize.Sequelize.STRING,
                allowNull: true
            },
            description: {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            },
            descriptionEn: {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            },
            videoUrl: {
                type: sequelize.Sequelize.STRING,
                allowNull: false
            },
            videoDuration: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            orderIndex: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            objectives: {
                type: sequelize.Sequelize.JSONB,
                defaultValue: []
            },
            status: {
                type: sequelize.Sequelize.ENUM('draft', 'published', 'archived'),
                defaultValue: 'draft',
                allowNull: false
            },
            thumbnailUrl: {
                type: sequelize.Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            }
        });

        console.log('✓ Lessons table created');

        // Create questions table
        await sequelize.getQueryInterface().createTable('questions', {
            id: {
                type: sequelize.Sequelize.UUID,
                defaultValue: sequelize.Sequelize.UUIDV4,
                primaryKey: true
            },
            lessonId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'lessons',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            questionText: {
                type: sequelize.Sequelize.TEXT,
                allowNull: false
            },
            questionTextEn: {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            },
            questionType: {
                type: sequelize.Sequelize.ENUM('multiple_choice', 'true_false'),
                allowNull: false,
                defaultValue: 'multiple_choice'
            },
            level: {
                type: sequelize.Sequelize.ENUM('high', 'medium', 'special_needs'),
                allowNull: false,
                defaultValue: 'medium'
            },
            options: {
                type: sequelize.Sequelize.JSONB,
                allowNull: true
            },
            correctAnswer: {
                type: sequelize.Sequelize.JSONB,
                allowNull: false
            },
            explanation: {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            },
            explanationEn: {
                type: sequelize.Sequelize.TEXT,
                allowNull: true
            },
            points: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 10
            },
            orderIndex: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            hints: {
                type: sequelize.Sequelize.JSONB,
                allowNull: true,
                defaultValue: []
            },
            createdAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            }
        });

        console.log('✓ Questions table created');

        // Create student_progress table
        await sequelize.getQueryInterface().createTable('student_progress', {
            id: {
                type: sequelize.Sequelize.UUID,
                defaultValue: sequelize.Sequelize.UUIDV4,
                primaryKey: true
            },
            studentId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'students',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            lessonId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'lessons',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            videoWatched: {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            videoProgress: {
                type: sequelize.Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            questionsAttempted: {
                type: sequelize.Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            questionsCorrect: {
                type: sequelize.Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            selectedLevel: {
                type: sequelize.Sequelize.ENUM('high', 'medium', 'special_needs'),
                allowNull: true
            },
            completedAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: true
            },
            score: {
                type: sequelize.Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00,
                allowNull: false
            },
            timeSpent: {
                type: sequelize.Sequelize.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            }
        });

        console.log('✓ Student progress table created');

        // Create student_answers table
        await sequelize.getQueryInterface().createTable('student_answers', {
            id: {
                type: sequelize.Sequelize.UUID,
                defaultValue: sequelize.Sequelize.UUIDV4,
                primaryKey: true
            },
            studentId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'students',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            questionId: {
                type: sequelize.Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'questions',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            studentAnswer: {
                type: sequelize.Sequelize.JSONB,
                allowNull: false
            },
            isCorrect: {
                type: sequelize.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            attemptNumber: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            timeSpent: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            hintsUsed: {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize.Sequelize.DATE,
                allowNull: false
            }
        });

        console.log('✓ Student answers table created');

        // Add indexes
        await sequelize.getQueryInterface().addIndex('lessons', ['subjectId']);
        await sequelize.getQueryInterface().addIndex('lessons', ['status']);
        await sequelize.getQueryInterface().addIndex('lessons', ['orderIndex']);

        await sequelize.getQueryInterface().addIndex('questions', ['lessonId']);
        await sequelize.getQueryInterface().addIndex('questions', ['level']);
        await sequelize.getQueryInterface().addIndex('questions', ['questionType']);

        await sequelize.getQueryInterface().addIndex('student_progress', ['studentId']);
        await sequelize.getQueryInterface().addIndex('student_progress', ['lessonId']);
        await sequelize.getQueryInterface().addIndex('student_progress', ['completedAt']);
        await sequelize.getQueryInterface().addIndex('student_progress', ['studentId', 'lessonId'], {
            unique: true,
            name: 'unique_student_lesson'
        });

        await sequelize.getQueryInterface().addIndex('student_answers', ['studentId']);
        await sequelize.getQueryInterface().addIndex('student_answers', ['questionId']);
        await sequelize.getQueryInterface().addIndex('student_answers', ['isCorrect']);

        console.log('✓ All indexes created');
        console.log('✅ Migration completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateLessonTables();
