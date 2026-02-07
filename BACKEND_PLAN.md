# Skill Hub - Laravel Backend Plan

## 1. Project Overview

The Skill Hub frontend is a Vite + React 19 SPA that currently uses Redux for state management with hardcoded data and a local `json-server` for mock persistence. This plan outlines a Laravel 11 REST API backend to replace the mock data layer with real authentication and persistent course management.

**Backend scope:**
- Admin-only authentication (single role) via Laravel Sanctum (token-based SPA auth)
- Full Course CRUD API with validation, filtering, and pagination

---

## 2. Current Frontend Analysis

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 19 |
| State | Redux Toolkit (3 slices: courses, admin, preferences) |
| Routing | React Router v7 (HashRouter) |
| HTTP | Axios |
| Styling | Tailwind CSS v4, Lucide icons, Framer Motion |

### Current Data Flow
- **Courses**: Hardcoded in `courseSlice.js` initial state (10 courses). CRUD via Redux reducers only (no API calls to persist).
- **Auth**: Hardcoded credentials (`admin` / `admin`) compared client-side in `loginForm.jsx`. No tokens, no sessions.
- **json-server**: A `db.json` with 2 courses exists but is not actively used by the main app logic.

### Existing Routes (Frontend)
| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Home (landing page) | No |
| `/catalogue` | Public course catalogue | No |
| `/course/:id` | Course detail page | No |
| `/course/add` | Add new course form | Yes (admin) |
| `/course/edit/:id` | Edit course form | Yes (admin) |
| `/dashboard` | Admin dashboard | Yes (admin) |
| `/about` | About us page | No |

---

## 3. Laravel Backend Architecture

### 3.1 Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | Laravel 11 | User preference, mature PHP framework |
| Auth | Laravel Sanctum | Token-based SPA authentication, first-party Laravel package |
| Database | MySQL 8 / PostgreSQL 15 | Standard relational DB for structured course data |
| API Format | JSON REST | Matches existing Axios usage in frontend |
| CORS | Laravel CORS middleware | Required for cross-origin SPA requests |

### 3.2 Project Structure

```
skill-hub-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   └── CourseController.php
│   │   ├── Middleware/
│   │   │   └── (Sanctum default middleware)
│   │   └── Requests/
│   │       ├── LoginRequest.php
│   │       ├── StoreCourseRequest.php
│   │       └── UpdateCourseRequest.php
│   └── Models/
│       ├── User.php (admin)
│       └── Course.php
├── database/
│   ├── migrations/
│   │   ├── xxxx_create_users_table.php
│   │   └── xxxx_create_courses_table.php
│   └── seeders/
│       ├── AdminSeeder.php
│       └── CourseSeeder.php
├── routes/
│   └── api.php
├── config/
│   ├── cors.php
│   └── sanctum.php
└── .env
```

---

## 4. Database Schema

### 4.1 `users` Table (Admin)

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | Admin display name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Used for login |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed |
| remember_token | VARCHAR(100) | NULLABLE | Laravel default |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Seed data:** One admin user seeded via `AdminSeeder.php`

### 4.2 `courses` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| title | VARCHAR(255) | NOT NULL | Course name |
| category | VARCHAR(100) | NOT NULL | Enum-like: Development, Design, Marketing, Business, Languages |
| level | VARCHAR(50) | NOT NULL | Enum-like: Beginner, Intermediate, Advanced, Expert |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'Draft' | Draft or Public |
| instructor | VARCHAR(255) | NOT NULL | Instructor name |
| price | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Course price |
| duration | INTEGER UNSIGNED | NOT NULL | Duration in minutes |
| description | TEXT | NULLABLE | Course description |
| students_number | INTEGER UNSIGNED | NOT NULL, DEFAULT 0 | Enrolled students count |
| certification | VARCHAR(50) | NOT NULL, DEFAULT 'Not Certificated' | "Certificated" or "Not Certificated" |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Note:** The frontend uses `studentsNumber` (camelCase). The API response will use a Resource/Transformer to map `students_number` (snake_case) to `studentsNumber` (camelCase) for frontend compatibility.

---

## 5. API Endpoints

### Base URL: `http://localhost:8000/api`

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|-------------|
| POST | `/login` | Admin login | No | `{ email, password }` |
| POST | `/logout` | Admin logout | Yes | - |
| GET | `/user` | Get authenticated user | Yes | - |

#### POST `/login`

**Request:**
```json
{
  "email": "admin@skillhub.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@skillhub.com"
  },
  "token": "1|abc123..."
}
```

**Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

#### POST `/logout`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET `/user`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@skillhub.com"
}
```

---

### 5.2 Course Endpoints

| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| GET | `/courses` | List all courses | No | Supports filtering, search, pagination |
| GET | `/courses/{id}` | Get single course | No | |
| POST | `/courses` | Create course | Yes | Validated |
| PUT | `/courses/{id}` | Update course | Yes | Validated |
| DELETE | `/courses/{id}` | Delete course | Yes | |

#### GET `/courses`

**Query Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `category` | string | Filter by category | `?category=Design` |
| `level` | string | Filter by level | `?level=Beginner` |
| `status` | string | Filter by status | `?status=Public` |
| `search` | string | Search title/description | `?search=react` |
| `sort_by` | string | Sort field | `?sort_by=price` |
| `sort_order` | string | Sort direction | `?sort_order=asc` |
| `per_page` | int | Items per page | `?per_page=10` |
| `page` | int | Page number | `?page=2` |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Advanced React Patterns",
      "category": "Development",
      "level": "Advanced",
      "status": "Public",
      "instructor": "Sarah Chen",
      "price": 850,
      "duration": 120,
      "description": "Master advanced React patterns...",
      "studentsNumber": 320,
      "certification": "Certificated"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 10,
    "total": 12
  }
}
```

#### GET `/courses/{id}`

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Advanced React Patterns",
    "category": "Development",
    "level": "Advanced",
    "status": "Public",
    "instructor": "Sarah Chen",
    "price": 850,
    "duration": 120,
    "description": "Master advanced React patterns...",
    "studentsNumber": 320,
    "certification": "Certificated"
  }
}
```

**Response (404):**
```json
{
  "message": "Course not found"
}
```

#### POST `/courses`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "New Course",
  "category": "Development",
  "level": "Beginner",
  "status": "Draft",
  "instructor": "Jane Doe",
  "price": 500,
  "duration": 90,
  "description": "A brand new course",
  "studentsNumber": 0,
  "certification": "Certificated"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| title | required, string, max:255 |
| category | required, string, in:Development,Design,Marketing,Business,Languages |
| level | required, string, in:Beginner,Intermediate,Advanced,Expert |
| status | required, string, in:Draft,Public |
| instructor | required, string, max:255 |
| price | required, numeric, min:0 |
| duration | required, integer, min:1 |
| description | nullable, string |
| studentsNumber | required, integer, min:0 |
| certification | required, string, in:Certificated,Not Certificated |

**Response (201):**
```json
{
  "data": {
    "id": 12,
    "title": "New Course",
    "category": "Development",
    ...
  },
  "message": "Course created successfully"
}
```

**Response (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "category": ["The selected category is invalid."]
  }
}
```

#### PUT `/courses/{id}`

Same request body and validation as POST. Returns updated course.

**Response (200):**
```json
{
  "data": { ... },
  "message": "Course updated successfully"
}
```

#### DELETE `/courses/{id}`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

---

## 6. Implementation Details

### 6.1 CourseResource (API Response Mapping)

A Laravel API Resource to transform snake_case DB columns to camelCase for frontend compatibility:

```php
// app/Http/Resources/CourseResource.php

class CourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => (string) $this->id,  // Frontend expects string IDs
            'title'          => $this->title,
            'category'       => $this->category,
            'level'          => $this->level,
            'status'         => $this->status,
            'instructor'     => $this->instructor,
            'price'          => (int) $this->price,
            'duration'       => $this->duration,
            'description'    => $this->description,
            'studentsNumber' => $this->students_number,
            'certification'  => $this->certification,
        ];
    }
}
```

### 6.2 CORS Configuration

```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:5173',  // Vite dev server
    'https://your-production-domain.com',
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['Content-Type', 'Authorization', 'Accept'],
'supports_credentials' => true,
```

### 6.3 Route Definitions

```php
// routes/api.php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{course}', [CourseController::class, 'show']);

// Protected routes (admin only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
});
```

### 6.4 Database Seeders

**AdminSeeder:**
```php
User::create([
    'name'     => 'Admin',
    'email'    => 'admin@skillhub.com',
    'password' => Hash::make('password'),  // Change in production!
]);
```

**CourseSeeder:** Seed the 10 courses from the current `courseSlice.js` initial state to maintain data consistency during migration.

---

## 7. Frontend Changes Required

After the Laravel backend is running, the React frontend needs these modifications:

### 7.1 API Service Layer

Create an Axios instance with base URL and token interceptor:

```
src/
├── api/
│   ├── axiosInstance.js    // Base config, interceptors, token handling
│   ├── authApi.js          // login(), logout(), getUser()
│   └── courseApi.js        // getCourses(), getCourse(), createCourse(), updateCourse(), deleteCourse()
```

### 7.2 Redux Slice Updates

- **adminSlice.js**: Replace hardcoded credentials with async thunks that call the auth API. Store token in memory (not localStorage for security). Track loading/error states.
- **courseSlice.js**: Replace hardcoded initial state with async thunks that fetch from API. Add loading/error states for CRUD operations.
- **preferenceSlice.js**: No changes needed (UI-only state).

### 7.3 Component Updates

| Component | Change |
|-----------|--------|
| `loginForm.jsx` | Replace client-side credential check with API call to `POST /login`. Store returned token. |
| `dashboard.jsx` | Fetch courses from API on mount instead of reading Redux initial state. |
| `catalogue.jsx` | Fetch public courses from API. Add server-side filtering support. |
| `coursePage.jsx` | Fetch single course from API by ID. |
| `courseAdd.jsx` | Submit form data to `POST /courses` with auth token. |
| `courseEdit.jsx` | Fetch course data from API, submit updates to `PUT /courses/{id}`. |

---

## 8. Setup Commands

```bash
# 1. Create Laravel project
composer create-project laravel/laravel skill-hub-api

# 2. Install Sanctum
composer require laravel/sanctum
php artisan install:api

# 3. Configure .env (database credentials)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=skillhub
# DB_USERNAME=root
# DB_PASSWORD=

# 4. Run migrations
php artisan migrate

# 5. Seed database
php artisan db:seed

# 6. Start server
php artisan serve
# API will be available at http://localhost:8000/api
```

---

## 9. Environment Variables

### Laravel `.env`
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### React Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 10. Development Milestones

| # | Milestone | Description |
|---|-----------|-------------|
| 1 | Laravel project setup | Create project, install Sanctum, configure CORS and database |
| 2 | Database migrations & seeders | Create users and courses tables, seed admin + 10 courses |
| 3 | Auth endpoints | Implement login, logout, get user with Sanctum tokens |
| 4 | Course CRUD endpoints | Implement all 5 course endpoints with validation and resources |
| 5 | Frontend API integration | Create Axios service layer, update Redux slices with async thunks |
| 6 | Frontend component updates | Wire up all components to use API calls instead of local state |
