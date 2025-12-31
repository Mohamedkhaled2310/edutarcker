import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../config/db_config.js';

const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        studentId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: Sequelize.literal(
                `'STU-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('student_seq')::text, 4, '0')`
            )

        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        classId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'classes',
                key: 'id'
            }
        },
        avatar: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                public_id: null,
                secure_url: "https://cdn.pixabay.com/photo/2014/04/03/10/41/person-311134_1280.png"
            }
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        enrollmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'graduated', 'transferred'),
            defaultValue: 'active'
        },
        attendanceRate: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        },
        behaviorScore: {
            type: DataTypes.INTEGER,
            defaultValue: 100
        },
        medicalInfo: {
            type: DataTypes.JSONB,
            defaultValue: {
                bloodType: null,
                allergies: [],
                conditions: []
            }
        }
    }, {
        tableName: 'students',
        timestamps: true,
        indexes: [
            { fields: ['classId'] },
            { fields: ['status'] },
            { fields: ['enrollmentDate'] }
        ],
    });

    Student.associate = (models) => {
        // Belongs to User
        Student.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // Belongs to Class
        Student.belongsTo(models.Class, {
            foreignKey: 'classId',
            as: 'class'
        });

        // Many-to-Many with Parents
        Student.belongsToMany(models.Parent, {
            through: 'student_parents',
            foreignKey: 'studentId',
            otherKey: 'parentId',
            as: 'parents'
        });

        // Has many Attendance records
        Student.hasMany(models.Attendance, {
            foreignKey: 'studentId',
            as: 'attendanceRecords'
        });

        // Has many Grades
        Student.hasMany(models.Grade, {
            foreignKey: 'studentId',
            as: 'grades'
        });

        // Has many Behavior Records
        Student.hasMany(models.BehaviorRecord, {
            foreignKey: 'studentId',
            as: 'behaviorRecords'
        });

        // Has many Guidance Cases
        Student.hasMany(models.GuidanceCase, {
            foreignKey: 'studentId',
            as: 'guidanceCases'
        });
    };
export default Student;
