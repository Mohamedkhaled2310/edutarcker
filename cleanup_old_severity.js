/**
 * Cleanup Script: Remove old severity ENUM values
 * 
 * This script removes the old severity values (low, medium, high)
 * and keeps only the new 4-degree system values
 */

import sequelize from './config/db_config.js';

async function cleanupOldSeverityValues() {
    try {
        console.log('Starting cleanup of old severity ENUM values...\n');

        // First, check current ENUM values
        const [currentEnum] = await sequelize.query(`
      SELECT 
        e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = (
        SELECT udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'behavior_records' 
        AND column_name = 'severity'
      )
      ORDER BY e.enumsortorder;
    `);

        console.log('Current ENUM values:');
        currentEnum.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.value}`);
        });

        // Check if there are any records using old values
        const [oldRecords] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM behavior_records
      WHERE severity IN ('low', 'medium', 'high', 'critical');
    `);

        if (oldRecords[0].count > 0) {
            console.log(`\n⚠️  Found ${oldRecords[0].count} records using old severity values.`);
            console.log('Migrating them to new values...');

            await sequelize.query(`
        UPDATE behavior_records
        SET severity = CASE 
          WHEN severity = 'low' THEN 'first_degree'
          WHEN severity = 'medium' THEN 'second_degree'
          WHEN severity = 'high' THEN 'third_degree'
          WHEN severity = 'critical' THEN 'fourth_degree'
          ELSE severity
        END
        WHERE severity IN ('low', 'medium', 'high', 'critical');
      `);

            console.log('✅ Records migrated successfully!');
        } else {
            console.log('\n✅ No records using old severity values.');
        }

        // Now remove old ENUM values
        console.log('\nRemoving old ENUM values from database...');

        const oldValues = ['low', 'medium', 'high', 'critical'];
        const currentValues = currentEnum.map(row => row.value);

        for (const oldValue of oldValues) {
            if (currentValues.includes(oldValue)) {
                try {
                    // Get the ENUM type name
                    const [typeInfo] = await sequelize.query(`
            SELECT udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'behavior_records' 
            AND column_name = 'severity';
          `);

                    const enumTypeName = typeInfo[0].udt_name;

                    // Remove the old value from ENUM
                    await sequelize.query(`
            ALTER TYPE ${enumTypeName} RENAME TO ${enumTypeName}_old;
          `);

                    // Create new ENUM with only new values
                    await sequelize.query(`
            CREATE TYPE ${enumTypeName} AS ENUM ('first_degree', 'second_degree', 'third_degree', 'fourth_degree');
          `);

                    // Update column to use new type
                    await sequelize.query(`
            ALTER TABLE behavior_records 
            ALTER COLUMN severity TYPE ${enumTypeName} 
            USING severity::text::${enumTypeName};
          `);

                    // Drop old type
                    await sequelize.query(`
            DROP TYPE ${enumTypeName}_old;
          `);

                    console.log(`✅ Successfully cleaned up ENUM type!`);
                    break; // Only need to do this once

                } catch (error) {
                    console.error(`Error removing value '${oldValue}':`, error.message);
                }
            }
        }

        // Verify final state
        const [finalEnum] = await sequelize.query(`
      SELECT 
        e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = (
        SELECT udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'behavior_records' 
        AND column_name = 'severity'
      )
      ORDER BY e.enumsortorder;
    `);

        console.log('\n✅ Final ENUM values:');
        finalEnum.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.value}`);
        });

        console.log('\n✅ Cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

cleanupOldSeverityValues();
