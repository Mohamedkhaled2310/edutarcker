import sequelize from '../config/db_config.js';

async function checkAndFixConstraint() {
    try {
        console.log('Checking current foreign key constraint on behavior_records...');

        // Check current constraint
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

        if (constraints.length > 0 && constraints[0].foreign_table_name === 'teachers') {
            console.log('⚠️  Constraint still points to teachers table. Fixing...');

            // Drop constraint
            await sequelize.query(`
        ALTER TABLE behavior_records 
        DROP CONSTRAINT IF EXISTS ${constraints[0].constraint_name};
      `);
            console.log('✅ Old constraint dropped');

            // Add new constraint to users
            await sequelize.query(`
        ALTER TABLE behavior_records 
        ADD CONSTRAINT behavior_records_reportedById_fkey 
        FOREIGN KEY ("reportedById") 
        REFERENCES users(id) 
        ON DELETE SET NULL;
      `);
            console.log('✅ New constraint added to users table');
        } else if (constraints.length > 0 && constraints[0].foreign_table_name === 'users') {
            console.log('✅ Constraint already points to users table - all good!');
        } else {
            console.log('⚠️  No constraint found, adding new one...');
            await sequelize.query(`
        ALTER TABLE behavior_records 
        ADD CONSTRAINT behavior_records_reportedById_fkey 
        FOREIGN KEY ("reportedById") 
        REFERENCES users(id) 
        ON DELETE SET NULL;
      `);
            console.log('✅ New constraint added');
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

checkAndFixConstraint();
