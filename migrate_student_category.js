import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add studentCategory field to students table...\n');

const runMigration = async () => {
    try {
        // Add studentCategory column with ENUM type
        await sequelize.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS "studentCategory" VARCHAR(50) 
            DEFAULT 'عادي' 
            NOT NULL
            CHECK ("studentCategory" IN ('عادي', 'اصحاب الهمم', 'اصحاب المراسيم', 'أبناء المواطنات'));
        `);

        console.log('✅ Column "studentCategory" added successfully!');

        // Create index for better query performance
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_students_category 
            ON students("studentCategory");
        `);

        console.log('✅ Index "idx_students_category" created successfully!');

        console.log('\n📋 Migration Summary:');
        console.log('   - Added column: studentCategory (VARCHAR(50))');
        console.log('   - Default value: عادي');
        console.log('   - Allowed values: عادي, اصحاب الهمم, اصحاب المراسيم, أبناء المواطنات');
        console.log('   - Created index: idx_students_category');
        console.log('\n✅ Migration completed successfully!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
};

runMigration();
