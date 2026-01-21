import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add classTeacherId to classes table (SIMPLE)...\n');

const runMigration = async () => {
    try {
        console.log('Step 1: Adding classTeacherId column...');

        // Just add the column - no foreign key in same statement
        await sequelize.query(`
            ALTER TABLE classes 
            ADD COLUMN "classTeacherId" UUID;
        `);

        console.log('✅ Column "classTeacherId" added successfully!');

        console.log('\nStep 2: Creating index...');

        // Create index for better query performance
        await sequelize.query(`
            CREATE INDEX idx_classes_teacher 
            ON classes("classTeacherId");
        `);

        console.log('✅ Index "idx_classes_teacher" created successfully!');

        console.log('\n📋 Migration Summary:');
        console.log('   - Added column: classTeacherId (UUID)');
        console.log('   - Created index: idx_classes_teacher');
        console.log('   - Note: Foreign key can be added later if needed');
        console.log('\n✅ Migration completed successfully!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
};

runMigration();
