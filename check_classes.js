const { models } = require('./utils/db_instance.js');
const { Class } = models;

async function checkClasses() {
    try {
        const classes = await Class.findAll({
            attributes: ['id', 'name', 'grade', 'section', 'academicYear', 'status'],
            order: [['grade', 'ASC'], ['section', 'ASC']],
            limit: 50
        });

        console.log('\n=== Available Classes ===\n');
        console.log(`Total classes found: ${classes.length}\n`);

        if (classes.length === 0) {
            console.log('⚠️  No classes found in the database!');
            console.log('You need to create classes before adding students.\n');
        } else {
            classes.forEach(cls => {
                console.log(`ID: ${cls.id}`);
                console.log(`Name: ${cls.name}`);
                console.log(`Grade: ${cls.grade}`);
                console.log(`Section: ${cls.section}`);
                console.log(`Academic Year: ${cls.academicYear}`);
                console.log(`Status: ${cls.status}`);
                console.log('---');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkClasses();
