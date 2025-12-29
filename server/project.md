# EduTracker Database Models (PostgreSQL)

## 1. Users
| Column      | Type       | Notes                       |
|------------|------------|-----------------------------|
| id         | UUID       | Primary Key                 |
| name       | STRING     |                             |
| email      | STRING     | Unique                      |
| password   | STRING     | Hashed                      |
| role       | ENUM       | ['admin','teacher','student','parent'] |
| avatar     | object     | File path                   |
| createdAt  | TIMESTAMP  |                             |
| updatedAt  | TIMESTAMP  |                             |

---

## 2. Students
| Column       | Type       | Notes                     |
|-------------|------------|---------------------------|
| id          | UUID       | Primary Key               |
| studentId   | STRING     | Unique                    |
| name        | STRING     |                           |
| grade       | STRING     |                           |
| class       | STRING     |                           |
| dateOfBirth | DATE       |                           |
| nationality | STRING     |                           |
| parentPhone | STRING     |                           |
| parentEmail | STRING     |                           |
| status      | STRING     | default: 'active'         |
| avatar      | object     | File path                 |
| createdAt   | TIMESTAMP  |                           |
| updatedAt   | TIMESTAMP  |                           |

---

## 3. Teachers
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| employeeId | STRING     | Unique                    |
| name       | STRING     |                           |
| department | STRING     |                           |
| subjects   | JSONB      | Array of subjects         |
| grades     | JSONB      | Array of grades           |
| phone      | STRING     |                           |
| email      | STRING     | Unique                    |
| avatar     | STRING     |                           |
| status     | STRING     | default: 'active'         |
| joinDate   | DATE       |                           |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 4. Attendance
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| studentId  | UUID       | FK → Students.id          |
| date       | DATE       |                           |
| status     | ENUM       | ['present','absent','late'] |
| checkInTime | TIME      | Optional                  |
| checkOutTime| TIME      | Optional                  |
| notes      | TEXT       | Optional                  |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 5. Grades
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| studentId  | UUID       | FK → Students.id          |
| subjectId  | UUID       | FK → Subjects.id          |
| semester   | INTEGER    |                           |
| year       | INTEGER    |                           |
| type       | ENUM       | ['homework','midterm','final'] |
| score      | FLOAT      |                           |
| maxScore   | FLOAT      |                           |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 6. Subjects
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| name       | STRING     | Unique                    |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 7. BehaviorRecords
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| studentId  | UUID       | FK → Students.id          |
| type       | STRING     | Violation/Positive        |
| severity   | STRING     | Optional                  |
| description| TEXT       |                           |
| points     | INTEGER    | For positive behavior     |
| date       | DATE       |                           |
| reportedBy | STRING     | Teacher/Admin             |
| status     | STRING     | pending/resolved          |
| action     | TEXT       | Optional                  |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 8. GuidanceCases
| Column       | Type       | Notes                     |
|-------------|------------|---------------------------|
| id          | UUID       | Primary Key               |
| studentId   | UUID       | FK → Students.id          |
| type        | STRING     | سلوكي/تحصيلي             |
| priority    | STRING     | high/medium/low           |
| status      | STRING     | active/closed             |
| description | TEXT       |                           |
| assignedTo  | STRING     | Counselor name            |
| sessions    | INTEGER    | Number of sessions        |
| lastSession | DATE       |                           |
| createdAt   | TIMESTAMP  |                           |
| updatedAt   | TIMESTAMP  |                           |

---

## 9. Communications
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| studentId  | UUID       | Optional                  |
| parentId   | UUID       | Optional                  |
| type       | STRING     | sms/email/notification    |
| template   | STRING     | Optional                  |
| message    | TEXT       |                           |
| sentAt     | TIMESTAMP  |                           |
| sentBy     | STRING     |                           |
| status     | STRING     | delivered/failed/pending  |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 10. Notifications
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| userId     | UUID       | FK → Users.id             |
| type       | STRING     | behavior/attendance/...   |
| title      | STRING     |                           |
| message    | TEXT       |                           |
| read       | BOOLEAN    | default: false            |
| actionUrl  | STRING     | Optional                  |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 11. Reports
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| title      | STRING     |                           |
| type       | STRING     | weekly/monthly/...        |
| grade      | STRING     |                           |
| createdBy  | STRING     |                           |
| status     | STRING     | pending/approved          |
| summary    | JSONB      | attendanceRate/avgGrade/... |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 12. Circulars
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| title      | STRING     |                           |
| content    | TEXT       |                           |
| priority   | STRING     | high/medium/low           |
| audience   | JSONB      | Array ['teachers','students',...] |
| createdBy  | STRING     |                           |
| createdAt  | TIMESTAMP  |                           |
| expiresAt  | TIMESTAMP  |                           |
| status     | STRING     | active/inactive           |
| attachments| JSONB      | name/url array             |
| updatedAt  | TIMESTAMP  |                           |

---

## 13. Classes
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| name       | STRING     | الصف/الفصل               |
| gradeLevel | STRING     | الصف الدراسي              |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

---

## 14. GradesLevels
| Column      | Type       | Notes                     |
|------------|------------|---------------------------|
| id         | UUID       | Primary Key               |
| name       | STRING     | الصف الدراسي              |
| createdAt  | TIMESTAMP  |                           |
| updatedAt  | TIMESTAMP  |                           |

