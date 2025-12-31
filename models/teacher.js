import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../config/db_config.js';


    const Teacher = sequelize.define('Teacher', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        employeeId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: Sequelize.literal(
                `'TCH-' || LPAD(nextval('teacher_seq')::text, 3, '0')`
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
        department: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
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
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
            defaultValue: 'active'
        },
        joinDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        qualification: {
            type: DataTypes.STRING,
            allowNull: true
        },
        specialization: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'teachers',
        timestamps: true,
        indexes: [
            { fields: ['department'] },
            { fields: ['status'] }
        ],
    });

    Teacher.associate = (models) => {
        // Belongs to User
        Teacher.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // Many-to-Many with Subjects
        Teacher.belongsToMany(models.Subject, {
            through: 'teacher_subjects',
            foreignKey: 'teacherId',
            otherKey: 'subjectId',
            as: 'subjects'
        });

        // Many-to-Many with Classes (a teacher can teach multiple classes)
        Teacher.belongsToMany(models.Class, {
            through: 'teacher_classes',
            foreignKey: 'teacherId',
            otherKey: 'classId',
            as: 'classes'
        });

        // Teacher reports behavior records
        Teacher.hasMany(models.BehaviorRecord, {
            foreignKey: 'reportedById',
            as: 'reportedBehaviors'
        });

        // Teacher handles guidance cases
        Teacher.hasMany(models.GuidanceCase, {
            foreignKey: 'assignedToId',
            as: 'guidanceCases'
        });

        // Teacher creates reports
        Teacher.hasMany(models.Report, {
            foreignKey: 'createdById',
            as: 'reports'
        });

        // Teacher sends communications
        Teacher.hasMany(models.Communication, {
            foreignKey: 'sentById',
            as: 'communications'
        });
    };

export default Teacher;