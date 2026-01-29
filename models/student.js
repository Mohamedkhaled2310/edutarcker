import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db_config.js';
import Joi from 'joi';

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
    studentCategory: {
        type: DataTypes.ENUM('عادي', 'اصحاب الهمم', 'اصحاب المراسيم', 'أبناء المواطنات'),
        defaultValue: 'عادي',
        allowNull: false
    },
    studentLevel: {
        type: DataTypes.ENUM('high', 'medium', 'special_needs'),
        field: 'student_level',  // Map to database column name
        defaultValue: 'medium',
        allowNull: false,
        comment: 'Student performance level based on diagnostic and formative assessments'
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
        { fields: ['enrollmentDate'] },
        { fields: ['studentCategory'] },
        { fields: ['student_level'] }  // Use database column name, not Sequelize field name
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


const validateCreateStudent = (obj) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required().messages({
            'string.empty': 'اسم الطالب مطلوب',
            'any.required': 'يجب إدخال اسم الطالب'
        }),
        grade: Joi.string().required(),
        class: Joi.string().required(),
        dateOfBirth: Joi.date().iso().required(),
        nationality: Joi.string().required(),
        address: Joi.string().min(5).required(),
        parentPhone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
        parentEmail: Joi.string().email().required(),
        bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required().messages({
            'any.only': 'فصيلة الدم يجب أن تكون واحدة من الفصائل المعروفة',
            'any.required': 'فصيلة الدم مطلوبة للجيل الجديد من السجلات'
        }),
        allergies: Joi.array().items(Joi.string()).optional().default([]),
        conditions: Joi.array().items(Joi.string()).optional().default([]),
        academicYear: Joi.string().required(),
        studentCategory: Joi.string().valid('عادي', 'اصحاب الهمم', 'اصحاب المراسيم', 'أبناء المواطنات').optional().default('عادي'),
    });

    return schema.validate(obj);
};
const validateUpdateStudent = (obj) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).optional(),
        grade: Joi.string().optional(),
        class: Joi.string().optional(),
        dateOfBirth: Joi.date().iso().optional(),
        nationality: Joi.string().optional(),
        address: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'graduated', 'transferred').optional(),
        bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
        allergies: Joi.array().items(Joi.string()).optional(),
        conditions: Joi.array().items(Joi.string()).optional(),
        attendanceRate: Joi.number().min(0).max(100).optional(),
        behaviorScore: Joi.number().integer().min(0).max(100).optional(),
        studentCategory: Joi.string().valid('عادي', 'اصحاب الهمم', 'اصحاب المراسيم', 'أبناء المواطنات').optional(),
        studentLevel: Joi.string().valid('high', 'medium', 'special_needs').optional()
    });
    return schema.validate(obj);
};
export { validateCreateStudent, validateUpdateStudent };
export default Student;
