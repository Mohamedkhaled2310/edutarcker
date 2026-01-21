import sequelize from './config/db_config.js';

console.log('🔍 Verifying studentCategory migration...\n');

const verify = async () => {
    try {
        // Check if column exists
        const [columns] = await sequelize.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'students' 
            AND column_name = 'studentCategory'
        `);

        if (columns.length > 0) {
            console.log('✅ Column "studentCategory" exists!');
            console.log('   Details:', columns[0]);
        } else {
            console.log('❌ Column "studentCategory" not found!');
        }

        // Check if index exists
        const [indexes] = await sequelize.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'students' 
            AND indexname = 'idx_students_category'
        `);

        if (indexes.length > 0) {
            console.log('✅ Index "idx_students_category" exists!');
        } else {
            console.log('❌ Index "idx_students_category" not found!');
        }

        console.log('\n✅ Verification completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
};

verify();
