import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add classTeacherId to classes table (FIXED)...\n');

const runMigration = async () => {
    try {
        console.log('Step 1: Adding classTeacherId column...');

        // Add classTeacherId column - simpler syntax
        await sequelize.query(`
            ALTER TABLE classes 
            ADD COLUMN "classTeacherId" UUID;
        `);

        console.log('✅ Column "classTeacherId" added successfully!');

        console.log('\nStep 2: Adding foreign key constraint...');

        // Add foreign key constraint separately
        await sequelize.query(`
            ALTER TABLE classes
            ADD CONSTRAINT fk_class_teacher
            FOREIGN KEY ("classTeacherId") 
            REFERENCES teachers(id)
            ON DELETE SET NULL;
        `);

        console.log('✅ Foreign key constraint added successfully!');

        console.log('\nStep 3: Creating index...');

        // Create index for better query performance
        await sequelize.query(`
            CREATE INDEX idx_classes_teacher 
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
