import sequelize from './config/db_config.js';
import TeacherSupportRecord from './models/teacherSupportRecord.js';

console.log('🔄 Creating TeacherSupportRecord table...');

// Only sync the new table
TeacherSupportRecord.sync({ force: false })
    .then(() => {
        console.log('✅ TeacherSupportRecord table created successfully!');
        console.log('📋 Table structure:');
        console.log('   - id (UUID, Primary Key)');
        console.log('   - teacherId (UUID, Foreign Key)');
        console.log('   - visitDate (DATE)');
        console.log('   - supportPlan (TEXT)');
        console.log('   - training (TEXT)');
        console.log('   - notes (TEXT)');
        console.log('   - createdById (UUID, Foreign Key)');
        console.log('   - createdAt, updatedAt (TIMESTAMPS)');
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    });
