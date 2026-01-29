/**
 * Migration Script: Update Severity Levels in behavior_records table
 * 
 * This script updates the severity ENUM from the old 3-level system (low, medium, high)
 * to the new 4-degree Arabic system (first_degree, second_degree, third_degree, fourth_degree)
 * 
 * Run this script after updating the model definition
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function migrateSeverityLevels() {
  const client = await pool.connect();

  try {
    console.log('Starting severity levels migration...');

    // Begin transaction
    await client.query('BEGIN');

    // Step 1: Add new ENUM type
    console.log('Creating new ENUM type...');
    await client.query(`
      CREATE TYPE severity_degree AS ENUM (
        'first_degree',
        'second_degree', 
        'third_degree',
        'fourth_degree'
      );
    `);

    // Step 2: Add temporary column with new type
    console.log('Adding temporary column...');
    await client.query(`
      ALTER TABLE behavior_records 
      ADD COLUMN severity_new severity_degree;
    `);

    // Step 3: Migrate existing data
    console.log('Migrating existing data...');
    await client.query(`
      UPDATE behavior_records
      SET severity_new = CASE 
        WHEN severity = 'low' THEN 'first_degree'::severity_degree
        WHEN severity = 'medium' THEN 'second_degree'::severity_degree
        WHEN severity = 'high' THEN 'third_degree'::severity_degree
        WHEN severity = 'critical' THEN 'fourth_degree'::severity_degree
        ELSE 'first_degree'::severity_degree
      END
      WHERE severity IS NOT NULL;
    `);

    // Step 4: Drop old column
    console.log('Dropping old severity column...');
    await client.query(`
      ALTER TABLE behavior_records 
      DROP COLUMN severity;
    `);

    // Step 5: Rename new column
    console.log('Renaming new column...');
    await client.query(`
      ALTER TABLE behavior_records 
      RENAME COLUMN severity_new TO severity;
    `);

    // Step 6: Drop old ENUM type (if it exists and is not used elsewhere)
    console.log('Cleaning up old ENUM type...');
    await client.query(`
      DROP TYPE IF EXISTS behavior_records_severity_enum CASCADE;
    `);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Migration completed successfully!');
    console.log('Severity levels have been updated to the new 4-degree system.');

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateSeverityLevels()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
