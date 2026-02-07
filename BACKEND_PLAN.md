# Skill Hub - Next.js + Supabase Migration Plan

## 1. Project Overview

The Skill Hub frontend is currently a **Vite + React 19 SPA** with Redux Toolkit, React Router (HashRouter), and Tailwind CSS v4. It uses hardcoded data and client-side credential checking. This plan outlines a full migration to **Next.js 16 (App Router) + Supabase** so that the frontend and backend live in the same repository with real authentication and persistent database storage.

**Migration scope:**
- Migrate from Vite + React Router to Next.js App Router
- Replace hardcoded Redux state with Supabase PostgreSQL database
- Replace client-side auth (`admin`/`admin`) with Supabase Auth
- Maintain the exact same UI/UX and design language
- One-click deploy to Vercel

---

## 2. Current Frontend Analysis

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 19 |
| State | Redux Toolkit (3 slices: courses, admin, preferences) |
| Routing | React Router v7 (HashRouter) |
| HTTP | Axios (installed but not used) |
| Styling | Tailwind CSS v4, Lucide icons, Framer Motion |
| Animations | `motion` (framer-motion), custom RotatingText component |
| Font | Gabarito (via CSS) |

### Current Data Flow
- **Courses**: 10 courses hardcoded in `courseSlice.js` initial state. CRUD via Redux reducers only -- no persistence.
- **Auth**: Hardcoded credentials (`admin`/`admin`) compared client-side in `loginForm.jsx`. `adminSlice.js` stores `loggedIn: true/false`.
- **Preferences**: `preferenceSlice.js` stores UI preferences (`catalogueView`, `dashboardView`). UI-only, no persistence needed.
- **json-server**: A `db.json` with 2 courses exists but is unused by the main app.

### Existing Routes (Frontend)
| Route | Page | Component | Auth Required |
|-------|------|-----------|--------------|
| `/#/` | Home (landing) | `home.jsx` | No |
| `/#/catalogue` | Public catalogue | `catalogue.jsx` | No |
| `/#/course/:id` | Course detail | `coursePage.jsx` | No |
| `/#/course/add` | Add course form | `courseAdd.jsx` | Yes (admin) |
| `/#/course/edit/:id` | Edit course form | `courseEdit.jsx` | Yes (admin) |
| `/#/dashboard` | Admin dashboard | `dashboard.jsx` | Yes (admin) |
| `/#/about` | About us | `aboutUs.jsx` | No |

### Current Components
| Component | File | Purpose |
|-----------|------|---------|
| Navbar | `navbar.jsx` | Sidebar nav (desktop) / bottom nav (mobile), login/logout, theme toggle |
| LoginForm | `loginForm.jsx` | Modal login overlay with username/password |
| FilterBar | `filterBar.jsx` | Course filter sidebar/sheet (category, level, price, certification) |
| CatalogueCardBoardView | `catalogueCardBoardView.jsx` | Course card for catalogue grid |
| RotatingText | `RotatingText.jsx` | Animated text rotation on home page |
| ThemeToggle | `themeToggle.jsx` | Dark/light mode toggle button |

### Assets
- `src/assets/insayd.jpg` - Team member photo
- `src/assets/user.png` - Default user photo
- `src/assets/react.png` - React logo
- `src/assets/redux.png` - Redux logo
- `src/assets/tailwind.png` - Tailwind logo

---

## 3. New Architecture: Next.js + Supabase

### 3.1 Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | Next.js 16 (App Router) | Full-stack React framework, API routes + SSR in one codebase |
| Database | Supabase (PostgreSQL) | Managed database with built-in auth, one-click integration |
| Auth | Supabase Auth | Email/password admin login, secure session management via cookies |
| Styling | Tailwind CSS v4 | Already used, seamless migration |
| Icons | Lucide React | Already used |
| Animations | Framer Motion (`motion`) | Already used |
| Deployment | Vercel | One-click deploy, automatic env var injection |

### 3.2 Project Structure (Next.js App Router)

```
skill-hub/
├── app/
│   ├── layout.tsx                 # Root layout (replaces App.jsx wrapper)
│   ├── page.tsx                   # Home page (from home.jsx)
│   ├── globals.css                # Global styles (from index.css)
│   ├── catalogue/
│   │   └── page.tsx               # Catalogue page (from catalogue.jsx)
│   ├── course/
│   │   ├── [id]/
│   │   │   └── page.tsx           # Course detail (from coursePage.jsx)
│   │   ├── add/
│   │   │   └── page.tsx           # Add course (from courseAdd.jsx)
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx       # Edit course (from courseEdit.jsx)
│   ├── dashboard/
│   │   └── page.tsx               # Admin dashboard (from dashboard.jsx)
│   ├── about/
│   │   └── page.tsx               # About us (from aboutUs.jsx)
│   └── api/
│       └── courses/
│           ├── route.ts           # GET (list) + POST (create)
│           └── [id]/
│               └── route.ts       # GET (single) + PUT (update) + DELETE
├── components/
│   ├── navbar.tsx                 # Sidebar/bottom nav
│   ├── login-form.tsx             # Login modal (Supabase Auth)
│   ├── filter-bar.tsx             # Course filter panel
│   ├── catalogue-card.tsx         # Course card
│   ├── rotating-text.tsx          # Animated text (from RotatingText.jsx)
│   └── theme-toggle.tsx           # Dark/light toggle
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts          # Auth session refresh
│   └── types.ts                   # TypeScript types (Course, etc.)
├── public/
│   └── images/                    # Static assets (team photos, logos)
├── scripts/
│   └── setup-database.sql         # Supabase migration script
├── middleware.ts                   # Next.js middleware for auth protection
└── package.json
```

---

## 4. Database Schema (Supabase PostgreSQL)

### 4.1 `courses` Table

```sql
CREATE TABLE courses (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Development', 'Design', 'Marketing', 'Business', 'Languages')),
  level         TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  status        TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Archive', 'Public')),
  instructor    TEXT NOT NULL,
  price         INTEGER NOT NULL DEFAULT 0,
  duration      INTEGER NOT NULL DEFAULT 0,
  description   TEXT,
  students_number INTEGER NOT NULL DEFAULT 0,
  certification TEXT NOT NULL DEFAULT 'Not Certificated' CHECK (certification IN ('Certificated', 'Not Certificated')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public: Anyone can read public courses
CREATE POLICY "Anyone can view public courses"
  ON courses FOR SELECT
  USING (status = 'Public');

-- Admin: Authenticated users can read all courses
CREATE POLICY "Authenticated users can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Admin: Authenticated users can insert
CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin: Authenticated users can update
CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (true);

-- Admin: Authenticated users can delete
CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (true);
```

### 4.3 Seed Data

Seed the 10 courses from the current `courseSlice.js` to maintain data consistency:

```sql
INSERT INTO courses (title, category, level, status, instructor, price, duration, description, students_number, certification) VALUES
('Advanced React Patterns', 'Development', 'Advanced', 'Public', 'Sarah Chen', 850, 120, 'Master advanced React patterns including hooks, context, and performance optimization', 320, 'Certificated'),
('UI/UX Fundamentals', 'Design', 'Beginner', 'Public', 'Alex Morgan', 600, 60, 'Learn the core principles of user interface and user experience design', 450, 'Certificated'),
('Digital Marketing Strategy', 'Marketing', 'Intermediate', 'Public', 'Mohammed Alami', 700, 80, 'Develop comprehensive digital marketing strategies for modern businesses', 280, 'Not Certificated'),
('Python for Data Science', 'Development', 'Intermediate', 'Public', 'Dr. Lisa Wang', 950, 100, 'Use Python libraries for data analysis, visualization, and machine learning', 510, 'Certificated'),
('Business Analytics', 'Business', 'Intermediate', 'Public', 'James Peterson', 800, 90, 'Make data-driven business decisions using analytics tools and frameworks', 195, 'Certificated'),
('Spanish Conversation', 'Languages', 'Beginner', 'Public', 'Maria Garcia', 350, 50, 'Build conversational Spanish skills through interactive practice sessions', 670, 'Not Certificated'),
('Brand Identity Design', 'Design', 'Expert', 'Public', 'David Kim', 1200, 150, 'Create compelling brand identities from concept to final deliverables', 180, 'Certificated'),
('Startup Essentials', 'Business', 'Beginner', 'Public', 'Fatima Zahir', 550, 70, 'Learn the fundamentals of launching and growing a successful startup', 420, 'Not Certificated'),
('SEO Mastery', 'Marketing', 'Advanced', 'Public', 'Omar Benali', 750, 85, 'Advanced search engine optimization techniques for maximum visibility', 290, 'Certificated'),
('French Grammar Intensive', 'Languages', 'Intermediate', 'Public', 'Claire Dubois', 450, 65, 'Master French grammar rules through structured lessons and exercises', 380, 'Certificated');
```

### 4.4 Admin User

Created via Supabase Auth (not a database table):
- **Email:** `admin@skillhub.com`
- **Password:** Set during Supabase dashboard setup or via seed script

---

## 5. Authentication Flow

### Current (Client-side only)
```
User enters admin/admin -> compare against Redux state -> set loggedIn: true
```

### New (Supabase Auth)
```
User enters email/password -> Supabase Auth API -> session cookie set -> middleware validates on protected routes
```

### Protected Routes (middleware.ts)
The following routes require authentication:
- `/dashboard`
- `/course/add`
- `/course/edit/*`

Unauthenticated users will be redirected to `/` with a login prompt.

---

## 6. API Routes (Next.js Route Handlers)

### 6.1 Course API

All course operations go through Supabase client directly (no separate API routes needed for simple CRUD). However, we can use Server Actions or Route Handlers for mutations:

#### Server Actions Approach (Recommended)

```typescript
// lib/actions/courses.ts
'use server'

export async function getCourses(filters?) {
  // Query Supabase with optional filters
  // Returns courses array
}

export async function getCourse(id: string) {
  // Query single course by ID
}

export async function createCourse(formData: FormData) {
  // Validate auth, insert into Supabase
}

export async function updateCourse(id: string, formData: FormData) {
  // Validate auth, update in Supabase
}

export async function deleteCourse(id: string) {
  // Validate auth, delete from Supabase
}
```

### 6.2 Auth Actions

```typescript
// lib/actions/auth.ts
'use server'

export async function signIn(formData: FormData) {
  // Supabase Auth signInWithPassword
  // Redirect to /dashboard on success
}

export async function signOut() {
  // Supabase Auth signOut
  // Redirect to /
}
```

---

## 7. Page-by-Page Migration Map

### 7.1 Home Page (`/`)
| Current | New |
|---------|-----|
| `src/pages/home.jsx` | `app/page.tsx` |
| Client component with Redux | Client component (no Redux needed) |
| `useSelector` for login state | `useAuth()` hook or server-side session check |
| RotatingText animation | Same, preserved as-is |
| Floating Lucide icons | Same, preserved as-is |

### 7.2 Catalogue (`/catalogue`)
| Current | New |
|---------|-----|
| `src/pages/catalogue.jsx` | `app/catalogue/page.tsx` |
| `useSelector` reads all courses from Redux | Server Component fetches from Supabase |
| Client-side filtering | Client-side filtering preserved (or move to server with search params) |
| FilterBar as client component | Same, passed courses as prop |

### 7.3 Course Detail (`/course/:id`)
| Current | New |
|---------|-----|
| `src/pages/coursePage.jsx` | `app/course/[id]/page.tsx` |
| `useSelector` + `useParams` | Server Component with `params.id`, direct Supabase query |
| Client-side course lookup | Server-side data fetching |

### 7.4 Add Course (`/course/add`)
| Current | New |
|---------|-----|
| `src/pages/courseAdd.jsx` | `app/course/add/page.tsx` |
| `dispatch(createCourse())` | Server Action `createCourse()` |
| Client-side validation | Same client-side validation + server-side validation |
| `Navigate` guard | Middleware auth guard |

### 7.5 Edit Course (`/course/edit/:id`)
| Current | New |
|---------|-----|
| `src/pages/courseEdit.jsx` | `app/course/edit/[id]/page.tsx` |
| `useSelector` to find course | Server Component fetches course by ID |
| `dispatch(editCourse())` | Server Action `updateCourse()` |
| `Navigate` guard | Middleware auth guard |

### 7.6 Dashboard (`/dashboard`)
| Current | New |
|---------|-----|
| `src/pages/dashboard.jsx` | `app/dashboard/page.tsx` |
| `useSelector` reads all courses | Server Component fetches all courses |
| Statistics computed in `useEffect` | Computed server-side |
| `dispatch(deleteCourse())` | Server Action `deleteCourse()` |
| `Navigate` guard | Middleware auth guard |

### 7.7 About (`/about`)
| Current | New |
|---------|-----|
| `src/pages/aboutUs.jsx` | `app/about/page.tsx` |
| Static content with images | Static content, images moved to `/public/images/` |
| No data fetching | No data fetching |

---

## 8. TypeScript Types

```typescript
// lib/types.ts

export interface Course {
  id: string
  title: string
  category: 'Development' | 'Design' | 'Marketing' | 'Business' | 'Languages'
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  status: 'Draft' | 'Archive' | 'Public'
  instructor: string
  price: number
  duration: number
  description: string | null
  students_number: number
  certification: 'Certificated' | 'Not Certificated'
  created_at: string
  updated_at: string
}

export interface CourseFilters {
  category?: string
  level?: string
  certification?: string
  priceMin?: number
  priceMax?: number
}
```

---

## 9. What Gets Removed

These libraries/files are no longer needed after migration:

| Removed | Reason |
|---------|--------|
| `react-router-dom` | Replaced by Next.js App Router file-based routing |
| `@reduxjs/toolkit` + `react-redux` | Replaced by Server Components + Supabase direct queries |
| `redux-ui` | Unused |
| `json-server` | Replaced by Supabase |
| `axios` | Replaced by Supabase client / fetch |
| `src/redux/*` (all slices) | No more client-side state for data |
| `db.json` | Replaced by Supabase database |
| `vite.config.js` | Replaced by `next.config.mjs` |
| `server.cjs` | No longer needed |
| `cors` package | Handled by Next.js |

### What Gets Preserved
| Preserved | Notes |
|-----------|-------|
| All Tailwind CSS classes | Exact same styling |
| Lucide React icons | Same usage |
| Framer Motion animations | Same RotatingText, hover effects |
| Gabarito font | Same typography |
| Dark mode system | Same `dark:` variant approach |
| All UI components | Same visual design, just adapted for Next.js patterns |

---

## 10. Development Milestones

| # | Milestone | Description |
|---|-----------|-------------|
| 1 | **Supabase Setup** | Connect Supabase integration, create `courses` table with RLS policies, seed 10 courses, set up admin user |
| 2 | **Next.js Scaffold + Layout** | Create root layout with Gabarito font, dark mode, Navbar component. Set up middleware for auth-protected routes. |
| 3 | **Home + About Pages** | Migrate static pages (home with RotatingText animation, about with team info). No database needed. |
| 4 | **Catalogue + Course Detail** | Migrate catalogue page with server-side data fetching from Supabase. Migrate course detail page. Preserve FilterBar as client component. |
| 5 | **Auth (Login/Logout)** | Implement Supabase Auth login modal, logout, session management. Wire up Navbar login/logout buttons. |
| 6 | **Dashboard + Course CRUD** | Migrate dashboard with server-fetched statistics. Implement add/edit/delete course forms with Server Actions backed by Supabase. |

---

## 11. Environment Variables

These will be automatically set when the Supabase integration is connected:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (for server-side admin operations)
```

No manual configuration needed -- Vercel handles it all.
