import { models } from './db_instance.js';

const { Grade, Student } = models;

/**
 * Calculate student level based on diagnostic and formative test averages
 * @param {string} studentId - Student UUID
 * @returns {Promise<string>} - 'high', 'medium', or 'special_needs'
 */
export const calculateStudentLevel = async (studentId) => {
    const student = await Student.findByPk(studentId);

    // Students with special needs category are automatically classified as special_needs
    if (student.studentCategory === 'اصحاب الهمم') {
        return 'special_needs';
    }

    // Get all diagnostic and formative test grades
    const grades = await Grade.findAll({
        where: { studentId },
        attributes: ['diagnosticTest', 'formativeTest']
    });

    if (grades.length === 0) {
        return 'medium'; // Default level if no grades
    }

    // Calculate average of diagnostic and formative tests
    let totalScore = 0;
    let count = 0;

    grades.forEach(grade => {
        if (grade.diagnosticTest > 0) {
            totalScore += parseFloat(grade.diagnosticTest);
            count++;
        }
        if (grade.formativeTest > 0) {
            totalScore += parseFloat(grade.formativeTest);
            count++;
        }
    });

    if (count === 0) {
        return 'medium'; // Default if no valid scores
    }

    const average = totalScore / count;

    // Classify based on average
    if (average >= 80) return 'high';
    if (average >= 60) return 'medium';
    return 'special_needs';
};

/**
 * Calculate academic status based on overall average
 * @param {number} overallAverage - Student's overall average percentage
 * @returns {string} - 'excellent', 'needs-support', or 'at-risk'
 */
export const calculateAcademicStatus = (overallAverage) => {
    if (overallAverage >= 85) return 'excellent';
    if (overallAverage >= 70) return 'needs-support';
    return 'at-risk';
};

/**
 * Calculate student's rank within their class
 * @param {string} studentId - Student UUID
 * @param {string} classId - Class UUID
 * @returns {Promise<number>} - Student's rank (1-based)
 */
export const calculateClassRank = async (studentId, classId) => {
    if (!classId) return 0;

    // Get all students in the class with their grades
    const students = await Student.findAll({
        where: { classId },
        include: [{
            model: Grade,
            as: 'grades',
            attributes: ['homework', 'participation', 'midterm', 'final', 'diagnosticTest', 'formativeTest', 'finalTest', 'semesterGrade']
        }]
    });

    // Calculate average for each student
    const studentAverages = students.map(s => {
        const grades = s.grades || [];
        if (grades.length === 0) return { id: s.id, average: 0 };

        let totalPercentage = 0;
        grades.forEach(g => {
            const total = parseFloat(g.homework || 0) + parseFloat(g.participation || 0) +
                parseFloat(g.midterm || 0) + parseFloat(g.final || 0);
            const percentage = (total / 200) * 100;
            totalPercentage += percentage;
        });

        const average = grades.length > 0 ? totalPercentage / grades.length : 0;
        return { id: s.id, average };
    });

    // Sort by average (descending)
    studentAverages.sort((a, b) => b.average - a.average);

    // Find rank
    const rank = studentAverages.findIndex(s => s.id === studentId) + 1;
    return rank || 0;
};
