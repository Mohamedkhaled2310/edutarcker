import sequelize from './config/db_config.js';
import { models } from './utils/db_instance.js';

const { Student, Class, Teacher } = models;

console.log('🧪 Testing student query with class teacher...\n');

const testQuery = async () => {
    try {
        console.log('Fetching students with class and teacher information...');

        const students = await Student.findAll({
            limit: 5,
            where: { status: 'active' },
            include: [
                {
                    model: Class,
                    as: 'class',
                    attributes: ['name', 'grade', 'section'],
                    include: [
                        {
                            model: Teacher,
                            as: 'classTeacher',
                            attributes: ['name'],
                            required: false
                        }
                    ]
                }
            ]
        });

        console.log(`\n✅ Query successful! Found ${students.length} students\n`);

        students.forEach((student, index) => {
            console.log(`${index + 1}. ${student.name}`);
            console.log(`   Grade: ${student.class?.grade || 'N/A'}`);
            console.log(`   Section: ${student.class?.section || 'N/A'}`);
            console.log(`   Teacher: ${student.class?.classTeacher?.name || 'Not assigned'}`);
            console.log(`   Category: ${student.studentCategory || 'N/A'}`);
            console.log('');
        });

        console.log('✅ All models are working correctly!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Query failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
};

testQuery();
