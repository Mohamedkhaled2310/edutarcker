import sequelize from '../config/db_config.js';

async function migrateReportedByToUsers() {
    try {
        console.log('Starting migration: Change reportedById foreign key from teachers to users...');

        // Step 1: Drop existing foreign key constraint FIRST
        console.log('Step 1: Dropping existing foreign key constraint...');
        await sequelize.query(`
      ALTER TABLE behavior_records 
      DROP CONSTRAINT IF EXISTS behavior_records_reportedById_fkey;
    `);
        console.log('✅ Existing constraint dropped');

        // Step 2: Update existing behavior records - replace teacher IDs with their corresponding user IDs
        console.log('Step 2: Updating existing behavior records to use user IDs instead of teacher IDs...');
        const [updateResult] = await sequelize.query(`
      UPDATE behavior_records br
      SET "reportedById" = t."userId"
      FROM teachers t
      WHERE br."reportedById" = t.id
      AND t."userId" IS NOT NULL;
    `);
        console.log(`✅ Updated ${updateResult.rowCount || 0} records with user IDs`);

        // Step 3: DELETE records that couldn't be mapped (instead of setting to NULL)
        console.log('Step 3: Deleting records that could not be mapped to users...');
        const [deleteResult] = await sequelize.query(`
      DELETE FROM behavior_records
      WHERE "reportedById" NOT IN (SELECT id FROM users);
    `);
        console.log(`✅ Deleted ${deleteResult.rowCount || 0} unmapped records`);

        // Step 4: Add new foreign key constraint pointing to users table
        console.log('Step 4: Adding new foreign key constraint to users table...');
        await sequelize.query(`
      ALTER TABLE behavior_records 
      ADD CONSTRAINT behavior_records_reportedById_fkey 
      FOREIGN KEY ("reportedById") 
      REFERENCES users(id) 
      ON DELETE SET NULL;
    `);
        console.log('✅ New constraint added successfully');

        console.log('✅ Migration completed successfully!');
        console.log('📝 All behavior records now reference users instead of teachers');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

migrateReportedByToUsers();
