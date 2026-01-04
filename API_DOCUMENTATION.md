# API Documentation - EduTracker

## Base URL
`http://localhost:<PORT>/api`

## Authentication
Most endpoints require a JWT token. After login, the token is set in a cookie named `token` and should be included in subsequent requests.

**Authorization Header (if needed):** `Authorization: Bearer <token>`

---

## 1. Authentication (`/api/auth`)

### 1.1 Register Admin
*Note: This is a temporary endpoint for bootstrapping.*
- **Method:** `POST`
- **URL:** `/api/auth/register-admin`
- **Access:** Public (when enabled)
- **Body:**
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "securepassword",
    "phone": "1234567890"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "status": "success",
    "message": "Admin created successfully",
    "user": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```

### 1.2 Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "name": "Ahmed Mohamed",
        "id": 1,
        "email": "user@example.com",
        "role": "admin",
        "avatar": "https://cloudinary.com/..."
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.3 Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Access:** Private (Authenticated)
- **Success Response (200):**
  ```json
  {
    "status": true,
    "message": "تم تسجيل الخروج بنجاح"
  }
  ```

---

## 2. Dashboard (`/api/dashboard`)
**Access:** Private (Admin only)

### 2.1 Get Statistics
- **Method:** `GET`
- **URL:** `/api/dashboard/stats`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalStudents": 450,
      "totalTeachers": 35,
      "attendanceRate": 92.5,
      "pendingReports": 12,
      "behaviorCases": 5,
      "activeCirculars": 8
    }
  }
  ```

### 2.2 Get Attendance Chart
- **Method:** `GET`
- **URL:** `/api/dashboard/attendance-chart`
- **Query Params:**
  - `period` (optional): `week` | `month` | `semester` (default: `week`)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "status": "success",
    "data": [
      {
        "grade": "First Grade",
        "attendance": 95,
        "absence": 5
      },
      {
        "grade": "Second Grade",
        "attendance": 88,
        "absence": 12
      }
    ]
  }
  ```

### 2.3 Get Performance Chart
- **Method:** `GET`
- **URL:** `/api/dashboard/performance-chart`
- **Query Params:**
  - `period` (optional): `week` | `month` | `semester` (default: `week`)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "subject": "Mathematics",
        "average": 78,
        "passing": 85
      },
      {
        "subject": "Science",
        "average": 82,
        "passing": 90
      }
    ]
  }
  ```

### 2.4 Create Class
- **Method:** `POST`
- **URL:** `/api/dashboard/create-class`
- **Body:**
  ```json
  {
    "grade": "First Grade",
    "section": "A",
    "academicYear": "2025-2026",
    "name": "فصل الأول - أ"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "status": "success",
    "data": {
      "class": {
        "id": 1,
        "grade": "First Grade",
        "section": "A",
        "name": "فصل الأول - أ",
        "academicYear": "2025-2026"
      }
    }
  }
  ```

---

## 3. Students (`/api/students`)

### 3.1 Get All Students
- **Method:** `GET`
- **URL:** `/api/students/all-student`
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `status` (default: 'active')
  - `search` (Search by name)
  - `grade` (Filter by grade)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "students": [
        {
          "id": 1,
          "name": "Ahmed Mohamed",
          "studentId": "STU1001",
          "grade": "First Grade",
          "class": "فصل الأول - أ",
          "avatar": "https://cloudinary.com/...",
          "status": "active",
          "attendanceRate": 95.5,
          "behaviorScore": 85,
          "parentPhone": "0123456789",
          "createdAt": "2025-09-01T10:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 450,
        "page": 1,
        "limit": 20,
        "totalPages": 23
      }
    }
  }
  ```

### 3.2 Get Student by ID
- **Method:** `GET`
- **URL:** `/api/students/spacific-student/:id`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Ahmed Mohamed",
      "studentId": "STU1001",
      "grade": "First Grade",
      "class": "فصل الأول - أ",
      "avatar": "https://cloudinary.com/...",
      "dateOfBirth": "2015-05-15",
      "nationality": "Egyptian",
      "address": "123 Main Street, Cairo",
      "enrollmentDate": "2025-09-01",
      "status": "active",
      "parent": {
        "fatherName": "Mohamed Ali",
        "fatherPhone": "0123456789",
        "motherName": "Fatima Hassan",
        "motherPhone": "0123456788",
        "email": "parent@example.com"
      },
      "medical": {
        "bloodType": "O+",
        "allergies": ["Peanuts"],
        "conditions": []
      }
    }
  }
  ```

### 3.3 Create Student
- **Method:** `POST`
- **URL:** `/api/students/create-student`
- **Access:** Admin
- **Body:**
  ```json
  {
    "name": "Ahmed Mohamed",
    "grade": "First Grade",
    "class": "A",
    "dateOfBirth": "2015-05-15",
    "nationality": "Egyptian",
    "address": "123 Main Street",
    "academicYear": "2025-2026",
    "parentPhone": "0123456789",
    "parentEmail": "parent@example.com",
    "bloodType": "O+",
    "allergies": ["Peanuts"],
    "conditions": []
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم إضافة الطالب بنجاح",
    "data": {
      "id": 1,
      "studentId": "STU1001"
    }
  }
  ```

### 3.4 Update Student
- **Method:** `PUT`
- **URL:** `/api/students/spacific-student/:id`
- **Body:** (Any fields to update)
  ```json
  {
    "name": "Ahmed Mohamed Updated",
    "address": "New Address",
    "bloodType": "A+"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم التحديث بنجاح"
  }
  ```

### 3.5 Delete Student (Archive)
- **Method:** `DELETE`
- **URL:** `/api/students/spacific-student/:id`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم أرشفة الطالب بنجاح"
  }
  ```

---

## 4. Attendance (`/api/attendance`)
**Access:** Private (Admin only)

### 4.1 Get Attendance
- **Method:** `GET`
- **URL:** `/api/attendance/return-attendance`
- **Query Params:**
  - `date` (Required, YYYY-MM-DD)
  - `grade` (Optional)
  - `class` (Optional, Section Name)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "studentId": "STU1001",
        "studentName": "Ahmed Mohamed",
        "date": "2025-10-10",
        "status": "present",
        "checkInTime": "08:00:00",
        "checkOutTime": "14:00:00",
        "notes": "Late arrival justified"
      },
      {
        "id": 2,
        "studentId": "STU1002",
        "studentName": "Sara Ali",
        "date": "2025-10-10",
        "status": "absent",
        "checkInTime": null,
        "checkOutTime": null,
        "notes": ""
      }
    ]
  }
  ```

### 4.2 Record Attendance
- **Method:** `POST`
- **URL:** `/api/attendance/record-attend`
- **Body:**
  ```json
  {
    "date": "2025-10-10",
    "records": [
      {
        "studentId": "STU12345",
        "status": "present",
        "checkInTime": "08:00",
        "checkOutTime": "14:00",
        "notes": "Optional note",
        "parentNotified": false
      }
    ]
  }
  ```
  **Note:** `studentId` is the custom student ID string, NOT the database primary key.
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل الحضور بنجاح",
    "data": {
      "totalRecorded": 25,
      "present": 20,
      "absent": 3,
      "late": 2
    }
  }
  ```

### 4.3 Get Student Attendance History
- **Method:** `GET`
- **URL:** `/api/attendance/attend/:studentId`
- **Query Params:**
  - `startDate` (Optional, YYYY-MM-DD)
  - `endDate` (Optional, YYYY-MM-DD)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalDays": 20,
        "present": 18,
        "absent": 1,
        "late": 1,
        "attendanceRate": 95.0
      },
      "records": [
        {
          "date": "2025-10-10",
          "status": "present",
          "checkInTime": "08:00:00",
          "notes": ""
        },
        {
          "date": "2025-10-09",
          "status": "late",
          "checkInTime": "09:30:00",
          "notes": "Bus delay"
        }
      ]
    }
  }
  ```

---

## 5. Teachers (`/api/teachers`)
**Access:** Private (Admin only)

### 5.1 Get All Teachers
- **Method:** `GET`
- **URL:** `/api/teachers`
- **Query Params:**
  - `department` (Optional)
  - `status` (Optional)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Dr. Mohamed Hassan",
        "employeeId": "TCH001",
        "department": "Mathematics",
        "subjects": ["Algebra", "Geometry"],
        "grades": ["First Grade", "Second Grade"],
        "phone": "0123456789",
        "email": "teacher@example.com",
        "avatar": "https://cloudinary.com/...",
        "status": "active",
        "joinDate": "2020-09-01"
      }
    ]
  }
  ```

### 5.2 Get Teacher by ID
- **Method:** `GET`
- **URL:** `/api/teachers/:id`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Dr. Mohamed Hassan",
      "employeeId": "TCH001",
      "department": "Mathematics",
      "phone": "0123456789",
      "email": "teacher@example.com",
      "avatar": {
        "public_id": "...",
        "secure_url": "https://cloudinary.com/..."
      },
      "status": "active",
      "joinDate": "2020-09-01",
      "qualification": "PhD in Mathematics",
      "specialization": "Algebra",
      "subjects": [
        {
          "id": 1,
          "name": "Algebra"
        }
      ],
      "classes": [
        {
          "id": 1,
          "grade": "First Grade",
          "name": "فصل الأول - أ"
        }
      ]
    }
  }
  ```

### 5.3 Create Teacher
- **Method:** `POST`
- **URL:** `/api/teachers`
- **Body:**
  ```json
  {
    "name": "Dr. Mohamed Hassan",
    "department": "Mathematics",
    "phone": "0123456789",
    "email": "teacher@example.com",
    "qualification": "PhD in Mathematics",
    "specialization": "Algebra",
    "joinDate": "2025-09-01",
    "subjects": [1, 2],
    "classes": [1, 2]
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم إضافة المعلم بنجاح",
    "data": {
      "id": 1,
      "employeeId": "TCH001"
    }
  }
  ```

### 5.4 Update Teacher
- **Method:** `PUT`
- **URL:** `/api/teachers/:id`
- **Body:**
  ```json
  {
    "name": "Dr. Mohamed Hassan Updated",
    "phone": "0123456788",
    "subjects": [1, 3],
    "classes": [1]
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم تحديث بيانات المعلم بنجاح"
  }
  ```

---

## 6. Subjects (`/api/subjects`)
**Access:** Private (Admin only)

### 6.1 Get All Subjects
- **Method:** `GET`
- **URL:** `/api/subjects`
- **Query Params:**
  - `gradeLevel` (Optional)
  - `status` (Optional)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Mathematics",
        "code": "MATH101",
        "gradeLevel": "First Grade",
        "passingGrade": 50,
        "status": "active",
        "createdAt": "2025-09-01T10:00:00.000Z"
      }
    ]
  }
  ```

### 6.2 Get Subject by ID
- **Method:** `GET`
- **URL:** `/api/subjects/:id`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101",
      "gradeLevel": "First Grade",
      "passingGrade": 50,
      "status": "active",
      "teachers": [
        {
          "id": 1,
          "name": "Dr. Mohamed Hassan"
        }
      ],
      "classes": [
        {
          "id": 1,
          "grade": "First Grade",
          "name": "فصل الأول - أ"
        }
      ]
    }
  }
  ```

### 6.3 Create Subject
- **Method:** `POST`
- **URL:** `/api/subjects`
- **Body:**
  ```json
  {
    "name": "Mathematics",
    "code": "MATH101",
    "gradeLevel": "First Grade",
    "passingGrade": 50,
    "status": "active"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم إضافة المادة بنجاح",
    "data": {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101"
    }
  }
  ```

### 6.4 Update Subject
- **Method:** `PUT`
- **URL:** `/api/subjects/:id`
- **Body:**
  ```json
  {
    "name": "Advanced Mathematics",
    "passingGrade": 60
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم تحديث المادة بنجاح"
  }
  ```

### 6.5 Delete Subject
- **Method:** `DELETE`
- **URL:** `/api/subjects/:id`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم حذف المادة بنجاح"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "status": "fail",
    "message": "لا يمكن حذف المادة لوجود درجات مرتبطة بها"
  }
  ```

---

## 7. Grades (`/api/grades`)
**Access:** Private (Admin/Teacher for POST, Authenticated for GET)

### 7.1 Get Student Grades
- **Method:** `GET`
- **URL:** `/api/grades/student/:studentId`
- **Query Params:**
  - `semester` (Optional)
  - `year` (Optional)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "student": {
        "id": 1,
        "name": "Ahmed Mohamed",
        "grade": "First Grade",
        "class": "فصل الأول - أ"
      },
      "semester": 1,
      "year": "2025-2026",
      "subjects": [
        {
          "name": "Mathematics",
          "homework": 18,
          "participation": 20,
          "midterm": 35,
          "final": 45,
          "total": 118,
          "percentage": 59,
          "grade": "مقبول"
        }
      ],
      "summary": {
        "totalPercentage": 78,
        "rank": 5,
        "totalStudents": 30,
        "gpa": "3.1"
      }
    }
  }
  ```

### 7.2 Record Grade
- **Method:** `POST`
- **URL:** `/api/grades`
- **Body:**
  ```json
  {
    "studentId": 1,
    "subjectId": 1,
    "semester": 1,
    "year": "2025-2026",
    "type": "homework",
    "score": 18,
    "maxScore": 20
  }
  ```
  **Note:** `type` can be: `homework`, `participation`, `midterm`, `final`
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل/تحديث الدرجة بنجاح"
  }
  ```

### 7.3 Update Grade
- **Method:** `PUT`
- **URL:** `/api/grades`
- **Body:**
  ```json
  {
    "studentId": 1,
    "subjectId": 1,
    "semester": 1,
    "year": "2025-2026",
    "type": "midterm",
    "score": 40
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم تحديث الدرجة بنجاح"
  }
  ```

### 7.4 Delete Grade
- **Method:** `DELETE`
- **URL:** `/api/grades`
- **Body:**
  ```json
  {
    "studentId": 1,
    "subjectId": 1,
    "semester": 1,
    "year": "2025-2026"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "تم حذف الدرجة بنجاح"
  }
  ```

---

## 8. Communications (`/api/communications`)
**Access:** Private (Admin/Teacher for POST, Authenticated for GET)

### 8.1 Get Parent Communications
- **Method:** `GET`
- **URL:** `/api/communications/parent/:parentId`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "type": "sms",
        "template": "attendance_alert",
        "message": "عزيزي ولي الأمر، نود إبلاغكم بأن الطالب غاب اليوم",
        "sentAt": "2025-10-10T08:30:00.000Z",
        "sentBy": "Dr. Mohamed Hassan",
        "status": "sent"
      }
    ]
  }
  ```

### 8.2 Send Communication
- **Method:** `POST`
- **URL:** `/api/communications/send`
- **Body:**
  ```json
  {
    "parentId": 1,
    "studentId": 1,
    "type": "sms",
    "templateId": "attendance_alert",
    "customMessage": "عزيزي ولي الأمر، نود إبلاغكم بأن الطالب غاب اليوم"
  }
  ```
  **Note:** `type` can be: `sms`, `email`, `notification`
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "تم إرسال الرسالة بنجاح",
    "data": {
      "messageId": 1,
      "status": "sent"
    }
  }
  ```

---

## Error Responses

All endpoints may return error responses in the following format:

### Validation Error (400)
```json
{
  "status": "fail",
  "message": "Validation error message"
}
```

### Unauthorized (401)
```json
{
  "status": "fail",
  "message": "Unauthorized access"
}
```

### Forbidden (403)
```json
{
  "status": "fail",
  "message": "Access denied"
}
```

### Not Found (404)
```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "status": "error",
  "message": "Internal server error",
  "stack": "Error stack trace (development only)"
}
```

---

## Notes for Frontend Implementation

1. **Authentication**: Store the JWT token from login response and include it in subsequent requests via cookies (automatically handled by browser) or Authorization header.

2. **Student ID vs Database ID**: 
   - `studentId` (string like "STU1001") is the custom student identifier
   - `id` (number) is the database primary key
   - Use the appropriate one based on the endpoint requirements

3. **Date Formats**: All dates should be in ISO 8601 format (YYYY-MM-DD or full timestamp)

4. **Pagination**: When fetching lists, use `page` and `limit` query parameters for pagination

5. **Error Handling**: Always check the `success` or `status` field in responses to determine if the request was successful

6. **Arabic Content**: Many responses include Arabic text for messages and labels
