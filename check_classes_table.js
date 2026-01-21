import sequelize from './config/db_config.js';

console.log('🔍 Checking database state for classes table...\n');

const checkDatabase = async () => {
    try {
        // Check if classTeacherId column exists
        const [columns] = await sequelize.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'classes' 
            AND column_name = 'classTeacherId'
        `);

        if (columns.length > 0) {
            console.log('✅ Column "classTeacherId" EXISTS in database!');
            console.log('   Details:', columns[0]);
        } else {
            console.log('❌ Column "classTeacherId" DOES NOT EXIST in database!');
            console.log('   Need to run migration...');
        }

        // Show all columns in classes table
        const [allColumns] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'classes'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 All columns in classes table:');
        allColumns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Check failed:', err.message);
        process.exit(1);
    }
};

checkDatabase();
