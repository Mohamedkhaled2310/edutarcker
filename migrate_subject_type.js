import sequelize from './config/db_config.js';
import { QueryTypes } from 'sequelize';

async function migrateSubjectType() {
    try {
        console.log('Starting subject type migration...');

        // Check if column already exists
        const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'subjects' 
      AND column_name = 'subjectType';
    `, { type: QueryTypes.SELECT });

        if (columns) {
            console.log('✓ Column subjectType already exists');
            return;
        }

        // Create ENUM type if it doesn't exist
        await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE subject_type_enum AS ENUM ('basic', 'activity');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        console.log('✓ Created subject_type_enum type');

        // Add subjectType column with default value
        await sequelize.query(`
      ALTER TABLE subjects 
      ADD COLUMN "subjectType" subject_type_enum DEFAULT 'basic';
    `);

        console.log('✓ Added subjectType column to subjects table');

        // Update existing subjects to have 'basic' type
        await sequelize.query(`
      UPDATE subjects 
      SET "subjectType" = 'basic' 
      WHERE "subjectType" IS NULL;
    `);

        console.log('✓ Updated existing subjects with default type');

        console.log('✅ Subject type migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

migrateSubjectType();
