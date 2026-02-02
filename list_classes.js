import sequelize from './config/db_config.js';
import { models } from './utils/db_instance.js';

const { Class } = models;

console.log('🔍 Checking available classes in database...\n');

const checkClasses = async () => {
    try {
        const classes = await Class.findAll({
            attributes: ['id', 'name', 'grade', 'section', 'academicYear', 'status'],
            order: [['grade', 'ASC'], ['section', 'ASC']],
            limit: 50
        });

        console.log(`Total classes found: ${classes.length}\n`);

        if (classes.length === 0) {
            console.log('⚠️  No classes found in the database!');
            console.log('You need to create classes before adding students.\n');
        } else {
            console.log('=== Available Classes ===\n');
            classes.forEach(cls => {
                console.log(`Grade: ${cls.grade}, Section: ${cls.section}, Year: ${cls.academicYear}`);
                console.log(`Name: ${cls.name}, Status: ${cls.status}`);
                console.log('---');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

checkClasses();
