# Skillify — Claude Code Context

## Project Overview
Skillify is a full-stack Learning Management System (LMS) inspired by Khan Academy.
- **Users**: Students enroll and learn, Teachers create courses, Admins moderate.
- **Working directory**: `c:\POC`

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Redux Toolkit (RTK Query), React Router v6, Bootstrap 5, Chart.js |
| Backend | Node.js + Express 4, Mongoose 8, JWT (access + refresh tokens via cookies) |
| Database | MongoDB Atlas (standard connection string — SRV DNS blocked on this network) |

## Running the Project

```bash
# Backend  (port 5000)
cd server && npm run dev

# Frontend (port 5175)
cd client && npm run dev

# Seed database
cd server && npm run seed
```

## Environment
- Server env file: `server/.env`
- MongoDB uses **standard connection string** (not `mongodb+srv://`) — SRV DNS is blocked on this network
- DB name: `skillify`
- `CLIENT_URL=http://localhost:5175` (Vite runs on 5175, not default 5173)

## Project Structure

```
POC/
├── client/src/
│   ├── app/store.js              # Redux store — all 8 RTK Query slices registered here
│   ├── features/auth/authSlice.js # Auth state: user, accessToken, isAuthenticated
│   ├── features/ui/uiSlice.js    # UI state: sidebarCollapsed
│   ├── hooks/
│   │   ├── useAuth.js            # Auth selectors
│   │   ├── useRole.js            # Role check helpers
│   │   └── useToast.js           # react-toastify wrapper — use showToast(msg, variant)
│   ├── services/                 # RTK Query APIs (8 files: auth, course, lesson, quiz, enrollment, progress, admin, user)
│   ├── components/
│   │   ├── common/               # Loader, EmptyState, ConfirmModal, Pagination, SearchBar, StatCard, ProtectedRoute, RoleRoute
│   │   ├── course/               # CourseCard, CourseGrid, CourseFilters, CourseProgressBar
│   │   ├── lesson/               # LessonSidebar, LessonContent
│   │   ├── quiz/                 # QuizQuestion, QuizResults
│   │   └── layout/               # Navbar, Sidebar, Footer, DashboardLayout
│   └── pages/
│       ├── public/               # HomePage, CourseCatalogPage, CourseDetailPage
│       ├── auth/                 # LoginPage, RegisterPage
│       ├── student/              # StudentDashboard, StudentLesson, StudentQuiz, StudentProgress
│       ├── teacher/              # TeacherDashboard, TeacherCourses, TeacherCourseForm, TeacherLessons, TeacherQuizzes, TeacherQuizForm, TeacherProgress
│       ├── admin/                # AdminDashboard, AdminUsers, AdminCourses, AdminAnalytics
│       └── misc/                 # UnauthorizedPage
└── server/
    ├── controllers/              # authController, courseController, lessonController, quizController, enrollmentController, progressController, adminController, userController
    ├── models/                   # User, Course, Lesson, Quiz, Enrollment, Progress
    ├── routes/                   # One file per resource
    ├── middleware/               # authMiddleware (verifyAccessToken), roleMiddleware (authorize), validateMiddleware, errorMiddleware
    ├── validators/               # express-validator schemas
    ├── utils/                    # asyncHandler, apiResponse (success/error), generateTokens
    └── seed/seed.js              # Seeds admin, teacher, student + sample courses/lessons/quizzes
```

## Key Conventions

### API Response Shape
All API responses use `success(res, data, message, statusCode)` from `utils/apiResponse.js`:
```js
{ success: true, data: { ... }, message: "..." }
// or on error:
{ success: false, message: "..." }
```

### RTK Query data access pattern
```js
const items = data?.data?.items || data?.data || []
```

### useToast
```js
const { showToast } = useToast()
showToast('Message', 'success')   // variants: success, danger, warning, info
```

### Component prop names (always use these)
- `StatCard`: `variant` (not `color`) for the color variant
- `CourseProgressBar`: accepts both `percent` and `percentage`
- `EmptyState`: use `description`, `actionLabel`, `actionTo`, `onAction`
- `ConfirmModal`: use `confirmLabel`, `confirmVariant`, `loading`

### Enroll mutation — pass courseId as a plain string
```js
await enroll(courseId).unwrap()   // CORRECT
await enroll({ courseId }).unwrap() // WRONG — double-wraps the body
```

### Quiz data format (matches Mongoose schema)
- Question field: `questionText` (not `text`)
- Options: `[{ id, text, isCorrect }]` — objects, not strings
- Attempt answers: `[{ questionId, selectedOptionId }]`

## Seeded Test Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@skillify.com | Admin@123 |
| Teacher | teacher@skillify.com | Teacher@123 |
| Student | student@skillify.com | Student@123 |

## Roles & Route Guards
- `ProtectedRoute` — requires `isAuthenticated`
- `RoleRoute` — requires specific role; unauthorized → `/unauthorized`
- Dashboard routes: `/student/dashboard`, `/teacher/dashboard`, `/admin/dashboard`

## MCP Server
 
Skillify exposes a Model Context Protocol server at `POST /api/v1/mcp`.
 
```
server/mcp/
├── mcpServer.js   # Express router — JSON-RPC 2.0 dispatcher + SSE endpoint
├── tools.js       # MCP tool definitions (JSON Schema for each tool)
└── handlers.js    # Tool implementations (DB queries → MCP content blocks)
```
 
**Transport:** HTTP POST `http://localhost:5000/api/v1/mcp`
**Auth:** `Authorization: Bearer <jwt>` OR `x-mcp-secret: <MCP_SECRET>` header
 
**Available Tools:**
| Tool | Description |
|------|-------------|
| `get_courses` | List/filter approved courses |
| `get_course_detail` | Full course with lessons + quizzes |
| `get_users` | Admin-only: list users |
| `get_enrollments` | Enrollment records by student/course |
| `get_student_progress` | Per-course progress for a student |
| `get_analytics_summary` | Platform-wide KPIs |
| `get_quiz_results` | Quiz attempt records |
| `search_content` | Full-text across courses/lessons/quizzes |
 
**Available Resources:** `skillify://analytics/summary`, `skillify://courses/catalog`
 
**Available Prompts:** `analyze_student`, `course_recommendation`, `quiz_question_generator`, `lesson_outline_generator`
 
**Quick test:**
```bash
curl -X POST http://localhost:5000/api/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
 
**Add `MCP_SECRET` to `server/.env`** to enable secret-based auth for MCP clients (optional).
 
## Claude Code Skills (Slash Commands)
 
Custom skills live in `.claude/skills/`. Invoke with `/skill-name` in Claude Code.
 
| Skill | Description |
|-------|-------------|
| `/generate-quiz` | Generate a complete quiz JSON for any topic — ready to seed or POST |
| `/generate-lesson` | Generate full lesson content (HTML + Mongoose doc) for any topic |
| `/analyze-student` | Pull live data via MCP and produce a student progress report |
| `/api-test` | Smoke-test all API endpoints including MCP; outputs pass/fail table |
| `/scaffold` | Generate controller+route+validator or page+service boilerplate |
| `/mcp-query` | Query the MCP server — shows curl commands and formats responses |
| `/check` | Audit project state: built pages, missing files, prop issues |
| `/debug` | Debug a reported bug or error |
| `/seed` | Seed or reset the database |

## Known Issues / Notes
- Bootstrap JS is NOT loaded — never use `data-bs-toggle`. Use React state for dropdowns/modals.
- The Navbar dropdown is fully React-controlled (`useState` + `useRef` for click-outside).
- Public pages wrap their return in `<div className="d-flex flex-column min-vh-100">` for sticky footer.
- MongoDB Atlas SRV DNS (`mongodb+srv://`) is blocked on this network — use the standard connection string in `.env`.
