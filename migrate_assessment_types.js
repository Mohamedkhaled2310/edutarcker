import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add assessment type columns to grades table...\n');

const runMigration = async () => {
    try {
        // Check if columns already exist
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'grades' 
      AND column_name IN ('diagnosticTest', 'formativeTest', 'finalTest', 'semesterGrade')
    `);

        if (results && results.length > 0) {
            console.log('⚠️  Assessment type columns already exist. Skipping migration.');
            console.log('Existing columns:', results.map(r => r.column_name).join(', '));
            process.exit(0);
            return;
        }

        console.log('Adding new assessment type columns...\n');

        // Add diagnosticTest column
        await sequelize.query(`
      ALTER TABLE grades
      ADD COLUMN IF NOT EXISTS "diagnosticTest" DECIMAL(5,2) DEFAULT 0.00
    `);
        console.log('✅ Added column: diagnosticTest');

        // Add formativeTest column
        await sequelize.query(`
      ALTER TABLE grades
      ADD COLUMN IF NOT EXISTS "formativeTest" DECIMAL(5,2) DEFAULT 0.00
    `);
        console.log('✅ Added column: formativeTest');

        // Add finalTest column
        await sequelize.query(`
      ALTER TABLE grades
      ADD COLUMN IF NOT EXISTS "finalTest" DECIMAL(5,2) DEFAULT 0.00
    `);
        console.log('✅ Added column: finalTest');

        // Add semesterGrade column
        await sequelize.query(`
      ALTER TABLE grades
      ADD COLUMN IF NOT EXISTS "semesterGrade" DECIMAL(5,2) DEFAULT 0.00
    `);
        console.log('✅ Added column: semesterGrade');

        // Verify the columns were added
        const [newColumns] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'grades' 
      AND column_name IN ('diagnosticTest', 'formativeTest', 'finalTest', 'semesterGrade')
      ORDER BY column_name
    `);

        console.log('\n📋 Migration Summary:');
        console.log('   - diagnosticTest (DECIMAL 5,2) - اختبار تشخيصي');
        console.log('   - formativeTest (DECIMAL 5,2) - اختبار تكويني');
        console.log('   - finalTest (DECIMAL 5,2) - اختبار النهائي');
        console.log('   - semesterGrade (DECIMAL 5,2) - درجة الفصل');
        console.log('\n✅ Migration completed successfully!');
        console.log(`\nVerified ${newColumns.length} new columns added to grades table.`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
};

runMigration();
