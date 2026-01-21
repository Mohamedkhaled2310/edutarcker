import sequelize from './config/db_config.js';

async function verifyColumns() {
    try {
        console.log('Checking behavior_records table columns...');

        const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'behavior_records' 
      AND column_name IN ('marks_deducted', 'occurrence_count', 'behavior_notes', 'is_child_protection_case')
      ORDER BY column_name;
    `);

        console.log('\nFound columns:');
        results.forEach(col => {
            console.log(`  ✓ ${col.column_name} (${col.data_type})`);
        });

        if (results.length === 4) {
            console.log('\n✅ All 4 new columns exist in the database!');
        } else {
            console.log(`\n⚠️  Only ${results.length} out of 4 columns found.`);
        }

        // Check indexes
        const [indexes] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'behavior_records' 
      AND indexname LIKE '%child_protection%';
    `);

        console.log('\nChild protection indexes:');
        indexes.forEach(idx => {
            console.log(`  ✓ ${idx.indexname}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

verifyColumns();
