import sequelize from '../config/db_config.js';

async function fixConstraintPermanently() {
    try {
        console.log('Fixing behavior_records foreign key constraint permanently...');

        // Step 1: Truncate behavior_records table
        console.log('Step 1: Truncating behavior_records table...');
        await sequelize.query(`TRUNCATE TABLE behavior_records CASCADE;`);
        console.log('✅ Table truncated');

        // Step 2: Drop ALL constraints on reportedById
        console.log('Step 2: Dropping all constraints on reportedById...');
        await sequelize.query(`
      ALTER TABLE behavior_records 
      DROP CONSTRAINT IF EXISTS behavior_records_reportedById_fkey;
    `);
        await sequelize.query(`
      ALTER TABLE behavior_records 
      DROP CONSTRAINT IF EXISTS behavior_records_reportedbyid_fkey;
    `);
        console.log('✅ All constraints dropped');

        // Step 3: Add new constraint to users table
        console.log('Step 3: Adding new constraint to users table...');
        await sequelize.query(`
      ALTER TABLE behavior_records 
      ADD CONSTRAINT behavior_records_reportedById_fkey 
      FOREIGN KEY ("reportedById") 
      REFERENCES users(id) 
      ON DELETE SET NULL;
    `);
        console.log('✅ New constraint added to users table');

        // Step 4: Verify the constraint
        console.log('Step 4: Verifying constraint...');
        const [constraints] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'behavior_records'
        AND tc.constraint_name LIKE '%reportedById%';
    `);
        console.log('Current constraint:', constraints);

        if (constraints[0]?.foreign_table_name === 'users') {
            console.log('✅ Constraint correctly points to users table!');
        } else {
            console.log('⚠️  Warning: Constraint may not be correct');
        }

        console.log('✅ Migration completed successfully!');
        console.log('📝 Note: behavior_records table was truncated');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

fixConstraintPermanently();
