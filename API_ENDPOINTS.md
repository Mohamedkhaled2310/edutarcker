# EduTracker API Documentation

## Database: PostgreSQL (Recommended)

### Why PostgreSQL?
- Excellent for relational data (students, teachers, classes, grades)
- Strong data integrity with foreign keys
- JSON/JSONB support for flexible fields
- Great performance with proper indexing
- Free and open source

---

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### POST /auth/login
Login user (admin, teacher, student, parent)

**Request:**
```json
{
  "email": "admin@school.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "admin@school.com",
      "role": "admin",
      "avatar": "/uploads/avatars/user1.jpg"
    }
  }
}
```

### POST /auth/logout
Logout current user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1250,
    "totalTeachers": 85,
    "attendanceRate": 94.5,
    "pendingReports": 12,
    "behaviorCases": 8,
    "activeCirculars": 5
  }
}
```

### GET /dashboard/attendance-chart
Get attendance data by grade for charts

**Query:** `?period=week|month|semester`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "grade": "الأول", "attendance": 95, "absence": 5 },
    { "grade": "الثاني", "attendance": 92, "absence": 8 },
    { "grade": "الثالث", "attendance": 88, "absence": 12 },
    { "grade": "الرابع", "attendance": 94, "absence": 6 },
    { "grade": "الخامس", "attendance": 91, "absence": 9 },
    { "grade": "السادس", "attendance": 89, "absence": 11 }
  ]
}
```

### GET /dashboard/performance-chart
Get performance data by subject

**Query:** `?period=week|month|semester`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "subject": "الرياضيات", "average": 85, "passing": 92 },
    { "subject": "العلوم", "average": 78, "passing": 88 },
    { "subject": "اللغة العربية", "average": 82, "passing": 95 },
    { "subject": "اللغة الإنجليزية", "average": 75, "passing": 85 },
    { "subject": "الدراسات", "average": 80, "passing": 90 }
  ]
}
```

---

## Students Endpoints

### GET /students
Get all students with pagination and filters

**Query:** `?page=1&limit=20&grade=الأول&search=أحمد&status=active`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "أحمد محمد علي",
        "studentId": "STU-2024-001",
        "grade": "الصف الأول",
        "class": "أ",
        "avatar": "/uploads/students/ahmed.jpg",
        "status": "active",
        "attendanceRate": 95,
        "behaviorScore": 85,
        "parentPhone": "0501234567",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "totalPages": 63
    }
  }
}
```

### GET /students/:id
Get single student details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "أحمد محمد علي",
    "studentId": "STU-2024-001",
    "grade": "الصف الأول",
    "class": "أ",
    "avatar": "/uploads/students/ahmed.jpg",
    "dateOfBirth": "2015-03-20",
    "nationality": "سعودي",
    "address": "الرياض، حي النرجس",
    "enrollmentDate": "2024-01-15",
    "status": "active",
    "parent": {
      "fatherName": "محمد علي",
      "fatherPhone": "0501234567",
      "motherName": "فاطمة أحمد",
      "motherPhone": "0507654321",
      "email": "parent@email.com"
    },
    "medical": {
      "bloodType": "A+",
      "allergies": ["الفول السوداني"],
      "conditions": []
    }
  }
}
```

### POST /students
Create new student

**Request:**
```json
{
  "name": "أحمد محمد علي",
  "grade": "الصف الأول",
  "class": "أ",
  "dateOfBirth": "2015-03-20",
  "nationality": "سعودي",
  "parentPhone": "0501234567",
  "parentEmail": "parent@email.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة الطالب بنجاح",
  "data": {
    "id": "uuid",
    "studentId": "STU-2024-002"
  }
}
```

### PUT /students/:id
Update student information

### DELETE /students/:id
Delete/archive student

---

## Attendance Endpoints

### GET /attendance
Get attendance records

**Query:** `?date=2024-01-15&grade=الأول&class=أ`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "أحمد محمد",
      "date": "2024-01-15",
      "status": "present",
      "checkInTime": "07:30:00",
      "checkOutTime": "14:00:00",
      "notes": ""
    }
  ]
}
```

### POST /attendance
Record attendance

**Request:**
```json
{
  "date": "2024-01-15",
  "records": [
    { "studentId": "uuid", "status": "present", "checkInTime": "07:30:00" },
    { "studentId": "uuid", "status": "absent", "reason": "مرض" },
    { "studentId": "uuid", "status": "late", "checkInTime": "08:15:00" }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم تسجيل الحضور بنجاح",
  "data": {
    "totalRecorded": 25,
    "present": 22,
    "absent": 2,
    "late": 1
  }
}
```

### GET /attendance/student/:studentId
Get student attendance history

**Query:** `?startDate=2024-01-01&endDate=2024-01-31`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDays": 22,
      "present": 20,
      "absent": 1,
      "late": 1,
      "attendanceRate": 90.9
    },
    "records": [
      {
        "date": "2024-01-15",
        "status": "present",
        "checkInTime": "07:30:00"
      }
    ]
  }
}
```

---

## Behavior Endpoints

### GET /behavior/violations
Get behavior violations

**Query:** `?page=1&limit=20&severity=high&status=pending`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "violations": [
      {
        "id": "uuid",
        "studentId": "uuid",
        "studentName": "محمد أحمد",
        "type": "تأخر متكرر",
        "severity": "medium",
        "description": "تأخر عن الحصة الأولى 3 مرات هذا الأسبوع",
        "date": "2024-01-15",
        "reportedBy": "أ. خالد",
        "status": "pending",
        "action": null
      }
    ],
    "stats": {
      "total": 45,
      "pending": 12,
      "resolved": 33
    }
  }
}
```

### POST /behavior/violations
Record new violation

**Request:**
```json
{
  "studentId": "uuid",
  "type": "تأخر متكرر",
  "severity": "medium",
  "description": "تأخر عن الحصة الأولى",
  "date": "2024-01-15"
}
```

### GET /behavior/positive
Get positive behavior records

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "سارة علي",
      "type": "تفوق دراسي",
      "description": "حصلت على الدرجة الكاملة في اختبار الرياضيات",
      "points": 10,
      "date": "2024-01-15",
      "awardedBy": "أ. فاطمة"
    }
  ]
}
```

### POST /behavior/positive
Record positive behavior

---

## Teachers Endpoints

### GET /teachers
Get all teachers

**Query:** `?department=الرياضيات&status=active`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "أحمد الشمري",
      "employeeId": "TCH-001",
      "department": "الرياضيات",
      "subjects": ["الرياضيات", "الإحصاء"],
      "grades": ["الأول", "الثاني", "الثالث"],
      "phone": "0501234567",
      "email": "teacher@school.com",
      "avatar": "/uploads/teachers/ahmed.jpg",
      "status": "active",
      "joinDate": "2020-09-01"
    }
  ]
}
```

### GET /teachers/:id
Get teacher details with schedule

### POST /teachers
Add new teacher

### PUT /teachers/:id
Update teacher information

---

## Grades & Performance Endpoints

### GET /grades/student/:studentId
Get student grades

**Query:** `?semester=1&year=2024`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid",
      "name": "أحمد محمد",
      "grade": "الصف الأول",
      "class": "أ"
    },
    "semester": 1,
    "year": 2024,
    "subjects": [
      {
        "name": "الرياضيات",
        "homework": 18,
        "participation": 9,
        "midterm": 42,
        "final": 85,
        "total": 154,
        "percentage": 77,
        "grade": "جيد جداً"
      }
    ],
    "summary": {
      "totalPercentage": 82,
      "rank": 5,
      "totalStudents": 30,
      "gpa": 3.5
    }
  }
}
```

### POST /grades
Record grades

**Request:**
```json
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "semester": 1,
  "type": "midterm",
  "score": 42,
  "maxScore": 50
}
```

---

## Communications Endpoints

### GET /communications/parent/:parentId
Get parent communication history

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "sms",
      "template": "غياب",
      "message": "نود إبلاغكم بغياب الطالب أحمد محمد اليوم",
      "sentAt": "2024-01-15T08:30:00Z",
      "sentBy": "أ. خالد",
      "status": "delivered"
    }
  ]
}
```

### POST /communications/send
Send message to parent

**Request:**
```json
{
  "parentId": "uuid",
  "studentId": "uuid",
  "type": "sms",
  "templateId": "absence",
  "customMessage": "نود إبلاغكم..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إرسال الرسالة بنجاح",
  "data": {
    "messageId": "uuid",
    "status": "sent"
  }
}
```

---

## Reports Endpoints

### GET /reports
Get all reports

**Query:** `?status=pending&type=weekly`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "تقرير الأداء الأسبوعي - الصف الأول",
      "type": "weekly",
      "grade": "الأول",
      "createdBy": "أ. محمد",
      "createdAt": "2024-01-15T10:00:00Z",
      "status": "pending",
      "summary": {
        "attendanceRate": 94,
        "averageGrade": 82,
        "behaviorIncidents": 3
      }
    }
  ]
}
```

### POST /reports
Create new report

### PUT /reports/:id/approve
Approve report

### GET /reports/:id/export
Export report as PDF

**Response:** PDF file stream

---

## Circulars Endpoints

### GET /circulars
Get administrative circulars

**Query:** `?status=active&audience=teachers`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "تعميم بخصوص الاختبارات النهائية",
      "content": "يرجى من جميع المعلمين...",
      "priority": "high",
      "audience": ["teachers", "admins"],
      "createdBy": "مدير المدرسة",
      "createdAt": "2024-01-10T09:00:00Z",
      "expiresAt": "2024-01-25T23:59:59Z",
      "status": "active",
      "attachments": [
        {
          "name": "جدول الاختبارات.pdf",
          "url": "/uploads/circulars/schedule.pdf"
        }
      ]
    }
  ]
}
```

### POST /circulars
Create new circular

---

## Notifications Endpoints

### GET /notifications
Get user notifications

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "notifications": [
      {
        "id": "uuid",
        "type": "behavior",
        "title": "حالة سلوكية جديدة",
        "message": "تم تسجيل مخالفة سلوكية للطالب محمد أحمد",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "actionUrl": "/students/uuid"
      }
    ]
  }
}
```

### PUT /notifications/:id/read
Mark notification as read

### PUT /notifications/read-all
Mark all notifications as read

---

## AI Assistant Endpoints

### POST /assistant/chat
Chat with AI assistant

**Request:**
```json
{
  "message": "ما هي نسبة الحضور هذا الأسبوع؟",
  "context": {
    "currentPage": "dashboard",
    "userRole": "admin"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "response": "نسبة الحضور هذا الأسبوع هي 94.5%، وهي أعلى من الأسبوع الماضي بنسبة 2%.",
    "suggestions": [
      "عرض تفاصيل الغياب",
      "مقارنة بالشهر الماضي",
      "إرسال تنبيهات لأولياء الأمور"
    ],
    "data": {
      "attendanceRate": 94.5,
      "previousWeek": 92.5,
      "change": 2
    }
  }
}
```

---

## Guidance Endpoints

### GET /guidance/cases
Get guidance/counseling cases

**Query:** `?status=active&priority=high`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "أحمد محمد",
      "type": "سلوكي",
      "priority": "high",
      "status": "active",
      "description": "تراجع ملحوظ في السلوك والتحصيل الدراسي",
      "assignedTo": "أ. سارة - المرشدة الطلابية",
      "createdAt": "2024-01-10T09:00:00Z",
      "sessions": 3,
      "lastSession": "2024-01-14T10:00:00Z"
    }
  ]
}
```

### POST /guidance/cases
Create new guidance case

### GET /guidance/at-risk
Get at-risk students

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "uuid",
      "studentName": "محمد علي",
      "grade": "الثاني",
      "riskLevel": "high",
      "riskFactors": [
        { "type": "attendance", "value": "غياب متكرر - 8 أيام" },
        { "type": "grades", "value": "تراجع في الدرجات - 15%" },
        { "type": "behavior", "value": "3 مخالفات سلوكية" }
      ],
      "recommendedAction": "جلسة إرشادية عاجلة"
    }
  ]
}
```

---

## File Upload Endpoints

### POST /upload/avatar
Upload user/student avatar

**Request:** `multipart/form-data` with `file` field

**Response (201):**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/avatars/filename.jpg",
    "thumbnail": "/uploads/avatars/thumb_filename.jpg"
  }
}
```

### POST /upload/document
Upload document attachment

---

## Error Responses

All endpoints return errors in this format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البريد الإلكتروني غير صالح",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` (401) - غير مصرح
- `FORBIDDEN` (403) - غير مسموح
- `NOT_FOUND` (404) - غير موجود
- `VALIDATION_ERROR` (400) - خطأ في البيانات
- `SERVER_ERROR` (500) - خطأ في الخادم

---

## Database Schema (PostgreSQL)

```sql
-- Main tables needed:
-- users, students, teachers, parents
-- attendance, grades, subjects
-- behavior_records, guidance_cases
-- communications, notifications
-- reports, circulars
-- classes, grades_levels
```

See `docs/DATABASE_SCHEMA.sql` for full schema.
