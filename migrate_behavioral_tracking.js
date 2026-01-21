import sequelize from './config/db_config.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Add behavioral tracking fields to behavior_records table
 * - marks_deducted: Integer field (1-4) for violation marks
 * - occurrence_count: Integer field to track repeated behaviors
 * - behavior_notes: Text field for detailed documentation
 * - is_child_protection_case: Boolean field for filtering
 */

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('Starting migration: Add behavioral tracking fields...');

        // Add marks_deducted field
        await queryInterface.addColumn('behavior_records', 'marks_deducted', {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 4
            },
            comment: 'Marks deducted for violations (0-4)'
        });
        console.log('✓ Added marks_deducted column');

        // Add occurrence_count field
        await queryInterface.addColumn('behavior_records', 'occurrence_count', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Number of times this behavior has occurred'
        });
        console.log('✓ Added occurrence_count column');

        // Add behavior_notes field
        await queryInterface.addColumn('behavior_records', 'behavior_notes', {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Detailed documentation of the committed behavior'
        });
        console.log('✓ Added behavior_notes column');

        // Add is_child_protection_case field
        await queryInterface.addColumn('behavior_records', 'is_child_protection_case', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Flag for child protection cases'
        });
        console.log('✓ Added is_child_protection_case column');

        // Add index on is_child_protection_case for better query performance
        await queryInterface.addIndex('behavior_records', ['is_child_protection_case'], {
            name: 'idx_behavior_records_child_protection'
        });
        console.log('✓ Added index on is_child_protection_case');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
