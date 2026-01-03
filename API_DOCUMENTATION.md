# API Documentation

## Base URL
`/api`

## Authentication
Most endpoints require a JWT token.
After login, the token is set in a cookie named `token`.
Some endpoints might also look for `Authorization: Bearer <token>` header depending on middleware configuration (currently middleware checks `req.cookies.token`).

---

## 1. Authentication (`/auth`)

### Register Admin
*Note: This is a temporary endpoint.*
- **Method:** `POST`
- **URL:** `/auth/register-admin`
- **Body:**
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "securepassword",
    "phone": "1234567890"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Admin created successfully",
    "user": { ... }
  }
  ```

### Login
- **Method:** `POST`
- **URL:** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "name": "...",
        "email": "...",
        "role": "admin",
        "avatar": "..."
      }
    },
    "token": "jwt_token_string"
  }
  ```

### Logout
- **Method:** `POST`
- **URL:** `/auth/logout`
- **Requires Auth:** Yes
- **Response:**
  ```json
  {
    "status": true,
    "message": "تم تسجيل الخروج بنجاح"
  }
  ```

---

## 2. Dashboard (`/dashboard`)
**Requires Auth:** Yes (Admin only)

### Get Statistics
- **Method:** `GET`
- **URL:** `/dashboard/stats`
- **Response:** Returns statistics for the dashboard.

### Get Attendance Chart
- **Method:** `GET`
- **URL:** `/dashboard/attendance-chart`
- **Response:** Data for attendance charts.

### Get Performance Chart
- **Method:** `GET`
- **URL:** `/dashboard/performance-chart`
- **Response:** Data for performance charts.

### Create Class
- **Method:** `POST`
- **URL:** `/dashboard/create-class`
- **Body:**
  ```json
  {
    "grade": "First Grade",
    "section": "A",
    "academicYear": "2025-2026",
    "name": "Optional Name"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": { "class": { ... } }
  }
  ```

---

## 3. Students (`/students`)

### Get All Students
- **Method:** `GET`
- **URL:** `/students/all-student`
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `status` (default: 'active')
  - `search` (Search by name)
  - `grade` (Filter by grade)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "students": [ ... ],
      "pagination": { ... }
    }
  }
  ```

### Get Student by ID
- **Method:** `GET`
- **URL:** `/students/spacific-student/:id`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "...",
      "parent": { ... },
      "medical": { ... }
    }
  }
  ```

### Create Student
- **Method:** `POST`
- **URL:** `/students/create-student`
- **Requires Auth:** Yes (Admin)
- **Body:**
  ```json
  {
    "name": "Student Name",
    "grade": "1",
    "class": "A", // section
    "dateOfBirth": "2010-01-01",
    "nationality": "Egyptian",
    "address": "123 Street",
    "academicYear": "2025-2026",
    "parentPhone": "010xxxxxxx",
    "parentEmail": "parent@example.com",
    "bloodType": "O+",
    "allergies": ["Peanuts"],
    "conditions": ["None"]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "تم إضافة الطالب بنجاح",
    "data": { ... }
  }
  ```

### Update Student
- **Method:** `PUT`
- **URL:** `/students/spacific-student/:id`
- **Body:** Fields to update (same as create student, plus medical info can be updated partially).
- **Response:**
  ```json
  {
    "success": true,
    "message": "تم التحديث بنجاح"
  }
  ```

### Delete Student
- **Method:** `DELETE`
- **URL:** `/students/spacific-student/:id`
- **Response:**
  ```json
  {
    "success": true,
    "message": "تم أرشفة الطالب بنجاح"
  }
  ```

---

## 4. Attendance (`/attendance`)
**Requires Auth:** Yes (Admin only)

### Get Attendance (Return Attendance)
Used to fetch students for a specific date and class/grade to display attendance sheet.
- **Method:** `GET`
- **URL:** `/attendance/return-attendance`
- **Query Params:**
  - `date` (Required, YYYY-MM-DD)
  - `grade` (Optional)
  - `class` (Optional, Section Name)
- **Response:**
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

### Record Attendance
- **Method:** `POST`
- **URL:** `/attendance/record-attend`
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
- **Response:**
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

### Get Student Attendance History
- **Method:** `GET`
- **URL:** `/attendance/attend/:studentId`
- **Query Params:**
  - `startDate` (Optional)
  - `endDate` (Optional)
- **Response:**
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
      }
    ]
  }
}
  ```
