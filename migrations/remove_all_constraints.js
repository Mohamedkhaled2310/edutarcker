import sequelize from '../config/db_config.js';

async function removeAllConstraintsAndReapply() {
    try {
        console.log('Finding and removing ALL constraints on reportedById...');

        // Step 1: Find ALL constraints on reportedById column
        const [allConstraints] = await sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'behavior_records'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%reported%';
    `);

        console.log('Found constraints:', allConstraints);

        // Step 2: Drop each constraint
        for (const constraint of allConstraints) {
            console.log(`Dropping constraint: ${constraint.constraint_name}`);
            await sequelize.query(`
        ALTER TABLE behavior_records 
        DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}";
      `);
        }
        console.log('✅ All constraints dropped');

        // Step 3: Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Add ONLY ONE new constraint to users table
        console.log('Adding new constraint to users table...');
        await sequelize.query(`
      ALTER TABLE behavior_records 
      ADD CONSTRAINT behavior_records_reportedById_fkey 
      FOREIGN KEY ("reportedById") 
      REFERENCES users(id) 
      ON DELETE SET NULL;
    `);
        console.log('✅ New constraint added');

        // Step 5: Verify
        const [finalConstraints] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'behavior_records'
        AND tc.constraint_name LIKE '%reported%';
    `);

        console.log('Final constraints:', finalConstraints);

        if (finalConstraints.length === 1 && finalConstraints[0].foreign_table_name === 'users') {
            console.log('✅✅✅ SUCCESS! Constraint correctly points to users table!');
        } else {
            console.log('⚠️ Warning: Multiple constraints or incorrect target');
        }

        console.log('✅ Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

removeAllConstraintsAndReapply();
