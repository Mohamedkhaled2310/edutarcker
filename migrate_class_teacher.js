import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add classTeacherId to classes table...\n');

const runMigration = async () => {
    try {
        // Add classTeacherId column
        await sequelize.query(`
            ALTER TABLE classes 
            ADD COLUMN IF NOT EXISTS "classTeacherId" UUID 
            REFERENCES teachers(id);
        `);

        console.log('✅ Column "classTeacherId" added successfully!');

        // Create index for better query performance
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_classes_teacher 
            ON classes("classTeacherId");
        `);

        console.log('✅ Index "idx_classes_teacher" created successfully!');

        console.log('\n📋 Migration Summary:');
        console.log('   - Added column: classTeacherId (UUID)');
        console.log('   - Foreign key reference: teachers(id)');
        console.log('   - Created index: idx_classes_teacher');
        console.log('\n✅ Migration completed successfully!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
};

runMigration();
