import { Op } from 'sequelize';
import Attendance from '../models/attendance.js';

/**
 * Calculate attendance statistics for a student
 * @param {string} studentId - Student UUID
 * @param {Date} startDate - Start date for calculation (default: start of current semester)
 * @param {Date} endDate - End date for calculation (default: today)
 * @returns {Object} Attendance statistics
 */
export const calculateAttendanceStats = async (studentId, startDate = null, endDate = null) => {
    // Default to current semester if dates not provided
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine semester start (September 1st or February 1st)
    if (!startDate) {
        if (currentMonth >= 8) { // September or later
            startDate = new Date(currentYear, 8, 1); // September 1st
        } else {
            startDate = new Date(currentYear, 1, 1); // February 1st
        }
    }

    if (!endDate) {
        endDate = now;
    }

    const attendanceRecords = await Attendance.findAll({
        where: {
            studentId,
            date: {
                [Op.between]: [startDate, endDate]
            }
        },
        order: [['date', 'ASC']]
    });

    const stats = {
        totalDays: attendanceRecords.length,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        excusedDays: 0,
        fridayAbsences: 0,
        consecutiveAbsences: 0,
        attendanceRate: 0,
        category: 'good' // good, warning, critical
    };

    let currentConsecutive = 0;
    let maxConsecutive = 0;

    attendanceRecords.forEach((record, index) => {
        const recordDate = new Date(record.date);
        const dayOfWeek = recordDate.getDay(); // 0 = Sunday, 5 = Friday

        switch (record.status) {
            case 'present':
                stats.presentDays++;
                currentConsecutive = 0;
                break;
            case 'absent':
                stats.absentDays++;
                currentConsecutive++;
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
                // Check if it's Friday (5 in JavaScript Date, but in many regions Friday is different)
                // Assuming Friday is day 5 (adjust based on your locale)
                if (dayOfWeek === 5) {
                    stats.fridayAbsences++;
                }
                break;
            case 'late':
                stats.lateDays++;
                currentConsecutive = 0;
                break;
            case 'excused':
                stats.excusedDays++;
                currentConsecutive = 0;
                break;
        }
    });

    stats.consecutiveAbsences = maxConsecutive;

    // Calculate attendance rate
    if (stats.totalDays > 0) {
        stats.attendanceRate = ((stats.presentDays + stats.lateDays) / stats.totalDays * 100).toFixed(2);
    }

    return stats;
};

/**
 * Determine attendance category for a student based on their stats
 * @param {Object} stats - Attendance statistics from calculateAttendanceStats
 * @returns {string} Attendance category in Arabic
 */
export const getAttendanceCategory = (stats) => {
    const { absentDays, lateDays, fridayAbsences } = stats;

    // Critical: More than 15 days absent
    if (absentDays > 15) {
        return 'أكثر من 15 يوم غياب';
    }

    // Warning: More than 5 days absent
    if (absentDays > 5) {
        return 'أكثر من 5 أيام غياب';
    }

    // Frequent Friday absences (3 or more Friday absences)
    if (fridayAbsences >= 3) {
        return 'غياب متكرر يوم الجمعة';
    }

    // Exactly 3 days absent
    if (absentDays === 3) {
        return '3 أيام غياب';
    }

    // 1-2 late arrivals
    if (lateDays >= 1 && lateDays <= 2) {
        return '1-2 تأخيرات';
    }

    // Good attendance
    return 'حضور جيد';
};

/**
 * Get attendance category severity level
 * @param {string} category - Attendance category in Arabic
 * @returns {string} Severity level: 'good', 'warning', 'critical'
 */
export const getCategorySeverity = (category) => {
    const severityMap = {
        'أكثر من 15 يوم غياب': 'critical',
        'أكثر من 5 أيام غياب': 'warning',
        'غياب متكرر يوم الجمعة': 'warning',
        '3 أيام غياب': 'warning',
        '1-2 تأخيرات': 'info',
        'حضور جيد': 'good'
    };

    return severityMap[category] || 'good';
};

/**
 * Get all students with a specific attendance category
 * @param {string} category - Attendance category to filter by
 * @param {Array} studentIds - Array of student IDs to check
 * @returns {Array} Array of student IDs matching the category
 */
export const getStudentsByAttendanceCategory = async (category, studentIds) => {
    const matchingStudents = [];

    for (const studentId of studentIds) {
        const stats = await calculateAttendanceStats(studentId);
        const studentCategory = getAttendanceCategory(stats);

        if (studentCategory === category) {
            matchingStudents.push({
                studentId,
                stats,
                category: studentCategory,
                severity: getCategorySeverity(studentCategory)
            });
        }
    }

    return matchingStudents;
};

/**
 * Check if a student has frequent Friday absences
 * @param {string} studentId - Student UUID
 * @param {number} threshold - Number of Friday absences to be considered "frequent" (default: 3)
 * @returns {boolean} True if student has frequent Friday absences
 */
export const hasFrequentFridayAbsences = async (studentId, threshold = 3) => {
    const stats = await calculateAttendanceStats(studentId);
    return stats.fridayAbsences >= threshold;
};

/**
 * Get attendance category color for UI
 * @param {string} category - Attendance category in Arabic
 * @returns {Object} Color configuration for UI
 */
export const getCategoryColor = (category) => {
    const colorMap = {
        'أكثر من 15 يوم غياب': {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            badge: 'bg-red-500'
        },
        'أكثر من 5 أيام غياب': {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-300',
            badge: 'bg-orange-500'
        },
        'غياب متكرر يوم الجمعة': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            badge: 'bg-yellow-500'
        },
        '3 أيام غياب': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            badge: 'bg-yellow-500'
        },
        '1-2 تأخيرات': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-300',
            badge: 'bg-blue-500'
        },
        'حضور جيد': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            badge: 'bg-green-500'
        }
    };

    return colorMap[category] || colorMap['حضور جيد'];
};

export default {
    calculateAttendanceStats,
    getAttendanceCategory,
    getCategorySeverity,
    getStudentsByAttendanceCategory,
    hasFrequentFridayAbsences,
    getCategoryColor
};
