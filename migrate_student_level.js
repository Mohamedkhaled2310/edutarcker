import sequelize from './config/db_config.js';

console.log('🔄 Running migration: Add studentLevel field to students table...\n');

const runMigration = async () => {
    try {
        // Check if column already exists
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'student_level'
        `);

        if (results.length > 0) {
            console.log('⚠️  Column student_level already exists. Skipping migration.');
            await sequelize.close();
            return;
        }

        console.log('📝 Adding student_level column...');

        // Step 1: Create ENUM type
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE enum_students_student_level AS ENUM ('high', 'medium', 'special_needs');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✅ ENUM type created');

        // Step 2: Add column
        await sequelize.query(`
            ALTER TABLE students 
            ADD COLUMN student_level enum_students_student_level DEFAULT 'medium' NOT NULL
        `);
        console.log('✅ Column added');

        // Step 3: Add index
        await sequelize.query(`
            CREATE INDEX students_student_level_idx ON students (student_level)
        `);
        console.log('✅ Index created');

        console.log('\n📋 Migration Summary:');
        console.log('   - Added column: student_level (ENUM)');
        console.log('   - Default value: medium');
        console.log('   - Index: students_student_level_idx');

        console.log('\n✅ Migration completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error(err);
    } finally {
        await sequelize.close();
    }
};

runMigration();
