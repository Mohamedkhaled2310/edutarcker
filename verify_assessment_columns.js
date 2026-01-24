import sequelize from './config/db_config.js';

console.log('🔍 Verifying assessment type columns in grades table...\n');

const verify = async () => {
    try {
        const [columns] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'grades' 
      AND column_name IN ('diagnosticTest', 'formativeTest', 'finalTest', 'semesterGrade')
      ORDER BY column_name
    `);

        if (columns.length === 0) {
            console.log('❌ No assessment type columns found!');
            process.exit(1);
        }

        console.log('✅ Found assessment type columns:\n');
        console.table(columns);

        console.log(`\n✅ Verification successful! All ${columns.length} columns exist.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
};

verify();
