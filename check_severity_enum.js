/**
 * Check Database Schema - Verify Severity ENUM Update
 * 
 * This script checks if the severity column in behavior_records table
 * has been updated to use the new 4-degree system
 */

import sequelize from './config/db_config.js';

async function checkSeverityEnum() {
    try {
        console.log('Checking severity ENUM in behavior_records table...\n');

        // Query to get ENUM values
        const [results] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'behavior_records' 
      AND column_name = 'severity';
    `);

        console.log('Column Information:');
        console.log(results);

        // Get ENUM values
        const [enumValues] = await sequelize.query(`
      SELECT 
        e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = (
        SELECT udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'behavior_records' 
        AND column_name = 'severity'
      )
      ORDER BY e.enumsortorder;
    `);

        console.log('\n✅ Current ENUM values for severity:');
        enumValues.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.value}`);
        });

        // Check if new values exist
        const newValues = ['first_degree', 'second_degree', 'third_degree', 'fourth_degree'];
        const currentValues = enumValues.map(row => row.value);

        const hasNewValues = newValues.every(val => currentValues.includes(val));

        if (hasNewValues) {
            console.log('\n✅ SUCCESS: Severity ENUM has been updated to the new 4-degree system!');
        } else {
            console.log('\n⚠️  WARNING: Severity ENUM still uses old values');
            console.log('Expected:', newValues);
            console.log('Found:', currentValues);
        }

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkSeverityEnum();
