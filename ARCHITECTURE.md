# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│           (http://localhost:3000)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pages                                               │   │
│  │ • Dashboard      - View all bugs                    │   │
│  │ • Report Bug     - Create new bug reports          │   │
│  │ • Bug Details    - View & analyze bugs             │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Components                                          │   │
│  │ • Layout      - Main wrapper                       │   │
│  │ • Header      - App header                         │   │
│  │ • Navigation  - Menu bar                           │   │
│  │ • BugCard     - Bug list item                      │   │
│  │ • Uploader    - File upload                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Services & State                                    │   │
│  │ • bugService  - API calls                          │   │
│  │ • appStore    - Zustand state                      │   │
│  │ • Types       - TypeScript interfaces              │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  Stack: React, TypeScript, Tailwind CSS, Vite, Zustand    │
└─────────────────────────────────────────────────────────────┘
              │                                  │
              ▼                                  ▼
    (axios HTTP requests)            (upload files)
              │                                  │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│              (http://localhost:5000/api)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Endpoints                                        │  │
│  │ • GET  /bugs         - List bugs                    │  │
│  │ • POST /bugs         - Create bug                   │  │
│  │ • GET  /bugs/:id     - Get bug details              │  │
│  │ • POST /bugs/:id/analyze - AI analysis              │  │
│  │ • PATCH /bugs/:id    - Update bug                   │  │
│  │ • DELETE /bugs/:id   - Delete bug                   │  │
│  │ • POST /upload       - Upload screenshot            │  │
│  │ • GET  /health       - Health check                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Route Handlers (TypeScript)                          │  │
│  │ • routes/bugs.ts   - Bug CRUD operations            │  │
│  │ • routes/upload.ts - File upload handling           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Core Services                                        │  │
│  │ • config.ts   - Configuration management            │  │
│  │ • db.ts       - Database initialization             │  │
│  │ • utils.ts    - AI analysis & utilities             │  │
│  │ • types.ts    - TypeScript interfaces               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  Stack: Express.js, TypeScript, Multer, Supabase-ready    │
└─────────────────────────────────────────────────────────────┘
              │                                  │
              ▼                                  ▼
    (JSON responses)                  (screenshot storage)
              │                                  │
┌──────────────────────────────────┬──────────────────────────┐
│   DATABASE (In-Memory / Mock)    │   FILE STORAGE           │
│                                  │                          │
│   bug_reports table              │   /uploads/ directory    │
│   ┌────────────────────────┐     │   (development)          │
│   │ id                     │     │                          │
│   │ title                  │     │   Supabase Storage       │
│   │ description            │     │   (production)           │
│   │ screenshot_url         │     │                          │
│   │ severity               │────────→ 1704992400000.png    │
│   │ affected_module        │     │    1704992400001.png    │
│   │ reproduction_steps     │     │    ...                  │
│   │ expected_result        │     │                          │
│   │ actual_result          │     │   Max: 10MB per file    │
│   │ status                 │     │   Types: PNG, JPG, etc. │
│   │ created_at             │     │                          │
│   │ updated_at             │     │                          │
│   │ user_id                │     │                          │
│   └────────────────────────┘     │                          │
│                                  │                          │
│   (Can be replaced with          │                          │
│    Supabase PostgreSQL)          │                          │
└──────────────────────────────────┴──────────────────────────┘
```

---

## Data Flow Diagram

### 1. Creating a Bug Report

```
User Input (Form)
       ↓
┌─────────────────────────┐
│ Frontend: ReportBug.tsx │ - Collects title, description, file
└─────────────────────────┘
       ↓
┌──────────────────────────┐
│ Service: bugService.ts   │ - Validates input
└──────────────────────────┘
       ↓
POST /api/bugs (with multipart/form-data)
       ↓
┌──────────────────────────┐
│ Backend: routes/bugs.ts  │ - Validates & creates bug record
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ In-Memory Database       │ - Stores in mockDatabase.bugReports
└──────────────────────────┘
       ↓
Response with BugReport object
       ↓
Frontend Updates UI & Zustand Store
       ↓
User sees new bug in Dashboard ✓
```

### 2. Uploading a Screenshot

```
User selects file
       ↓
┌────────────────────────────────────┐
│ ScreenshotUploader Component       │ - Validates file type
└────────────────────────────────────┘
       ↓
POST /api/upload (multipart/form-data)
       ↓
┌────────────────────────────────────┐
│ Backend: routes/upload.ts          │ - Multer configuration
│ • Validates image type             │
│ • Generates unique filename        │
│ • Saves to /uploads/ directory     │
└────────────────────────────────────┘
       ↓
Returns { url: "/uploads/...", path: "..." }
       ↓
Frontend receives URL
       ↓
Shows preview & stores URL for bug creation ✓
```

### 3. Analyzing a Bug

```
User clicks "Analyze Bug"
       ↓
┌────────────────────────────────┐
│ Frontend: BugDetails.tsx       │ - Shows loading state
└────────────────────────────────┘
       ↓
POST /api/bugs/:id/analyze
       ↓
┌────────────────────────────────┐
│ Backend: routes/bugs.ts        │
│ • Sets status: "analyzing"     │
│ • Calls AI analysis function   │
└────────────────────────────────┘
       ↓
┌────────────────────────────────┐
│ AI Analysis (mockAIAnalysis)   │
│ • Parses bug description       │
│ • Detects severity level       │
│ • Identifies module            │
│ • Generates reproduction steps │
│ • Formats results              │
└────────────────────────────────┘
       ↓
Updates bug in database:
• Sets status: "completed"
• Sets severity
• Sets affected_module
• Sets reproduction_steps
• Sets expected_result
• Sets actual_result
       ↓
Returns AnalysisResult object
       ↓
Frontend updates bug details
       ↓
User sees analysis results ✓
```

---

## Component Hierarchy

```
App (Router)
│
├── Layout
│   │
│   ├── Header
│   │   └── Logo & Title
│   │
│   ├── Navigation
│   │   ├── Dashboard Link
│   │   └── Report Bug Link
│   │
│   └── Main Content (Outlet)
│       │
│       ├── Dashboard Route
│       │   ├── Stats Cards
│       │   │   ├── Total Reports
│       │   │   ├── Completed
│       │   │   └── Critical Issues
│       │   │
│       │   └── Bug List
│       │       └── BugCard (multiple)
│       │
│       ├── ReportBug Route
│       │   ├── Title Input
│       │   ├── Description Input
│       │   ├── ScreenshotUploader
│       │   │   ├── Drop Zone
│       │   │   └── Preview
│       │   │
│       │   └── Submit Button
│       │
│       └── BugDetails Route
│           ├── Bug Info Header
│           ├── Stats Grid
│           ├── Screenshot Display
│           ├── Reproduction Steps List
│           └── Expected vs Actual Results
```

---

## State Management (Zustand)

```
AppStore
├── user: User | null
│   └── Data about logged-in user
│
├── bugReports: BugReport[]
│   └── Array of all bug reports
│
├── isLoading: boolean
│   └── Loading state for API calls
│
├── error: string | null
│   └── Error messages
│
└── Actions:
    ├── setUser(user)
    ├── setBugReports(reports)
    ├── addBugReport(report)
    ├── updateBugReport(id, updates)
    ├── setIsLoading(loading)
    ├── setError(error)
    └── clearError()
```

---

## API Response Flow

```
┌──────────────────────────────────────────┐
│         Frontend Component               │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│    bugService.ts (API Client)            │
│  • Uses axios                            │
│  • Base URL: /api                        │
│  • Handles requests/responses            │
└──────────────────────────────────────────┘
           ↓ (HTTP)
┌──────────────────────────────────────────┐
│    Express Server (Backend)              │
│    PORT: 5000                            │
│  • CORS enabled                          │
│  • JSON parser enabled                   │
│  • File upload configured                │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│         API Routes                       │
│  /api/bugs                               │
│  /api/upload                             │
│  /api/health                             │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│    Route Handlers (TypeScript)           │
│  • Validation                            │
│  • Processing                            │
│  • Database operations                   │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│         Mock Database                    │
│  In-memory mockDatabase object           │
│  • bugReports array                      │
│  • users array                           │
└──────────────────────────────────────────┘
           ↓ (JSON Response)
┌──────────────────────────────────────────┐
│      Back to Frontend                    │
│  • Update Zustand store                  │
│  • Update component state                │
│  • Re-render UI                          │
└──────────────────────────────────────────┘
```

---

## Technology Stack Layers

```
┌────────────────────────────────────────┐
│         UI Layer                       │
│    React Components + JSX              │
│    Tailwind CSS Styling                │
│    React Router Navigation             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      State Management Layer            │
│      Zustand Store                     │
│      Component Local State             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Service Layer                     │
│      bugService.ts                     │
│      Axios HTTP Client                 │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      HTTP/REST Layer                   │
│      Express.js Server                 │
│      RESTful API Endpoints              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Business Logic Layer              │
│      Route Handlers                    │
│      Validation                        │
│      AI Analysis                       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Data Layer                        │
│      Mock Database (In-Memory)         │
│      File Storage (Uploads)            │
└────────────────────────────────────────┘
```

---

## Request/Response Cycle Example

### Example: Create Bug Report

**Request:**
```http
POST /api/bugs HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "When I click login, nothing happens",
  "screenshot_url": "/uploads/1234567890.png"
}
```

**Backend Processing:**
```
1. Receive request in Express router
2. Validate input (title, description required)
3. Generate unique ID: bug_<uuid>
4. Create BugReport object
5. Add to mockDatabase.bugReports
6. Return with 201 Created status
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "bug_123e4567-e89b-12d3-a456-426614174000",
  "title": "Login button not working",
  "description": "When I click login, nothing happens",
  "screenshot_url": "/uploads/1234567890.png",
  "severity": "medium",
  "affected_module": "Unknown",
  "reproduction_steps": [],
  "expected_result": "",
  "actual_result": "When I click login, nothing happens",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "user_id": "default_user"
}
```

**Frontend Processing:**
```
1. Receive response
2. Check status code (201)
3. Parse JSON response
4. Update Zustand store: addBugReport()
5. Show toast: "Bug reported successfully!"
6. Navigate to bug details page
7. Display bug info to user
```

---

## File Organization Strategy

```
SEPARATION OF CONCERNS:

Frontend:
├── pages/       → Page-level logic & layout
├── components/  → Reusable UI components
├── services/    → API communication
├── store/       → Global state
├── types/       → TypeScript definitions
└── styles/      → CSS/Tailwind

Backend:
├── routes/      → API endpoint handlers
├── config.ts    → Configuration
├── db.ts        → Database setup
├── types.ts     → TypeScript definitions
├── utils.ts     → Utilities & AI logic
└── index.ts     → Server entry point
```

---

## Error Handling Flow

```
┌─────────────────────────┐
│   Try-Catch Blocks      │
│   in API calls          │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│  Error Caught           │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│  Update Zustand Store   │
│  setError(message)      │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│  Show Toast Notification│
│  toast.error(message)   │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│  Update UI State        │
│  Disable buttons, etc.  │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│  User sees error message│
│  and can retry          │
└─────────────────────────┘
```

---

## Deployment Architecture (Optional)

```
┌────────────────────────────────────────┐
│      Vercel (Frontend)                 │
│  • Automatic deployments               │
│  • Global CDN                          │
│  • Environment variables               │
│  https://app.vercel.app                │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Railway/Heroku (Backend)          │
│  • Docker containerization             │
│  • Environment variables               │
│  • Database integration                │
│  https://api.railway.app               │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Supabase (Database + Storage)     │
│  • PostgreSQL database                 │
│  • File storage buckets                │
│  • Real-time subscriptions             │
│  https://project.supabase.co           │
└────────────────────────────────────────┘

All connected via environment variables
```

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| State Management | Zustand | Lightweight, simple API |
| HTTP Client | Axios | Promise-based, interceptors |
| CSS Framework | Tailwind | Utility-first, fast development |
| Bundler | Vite | Fast dev server, quick builds |
| Server Framework | Express.js | Simple, flexible, well-documented |
| File Upload | Multer | De facto standard, reliable |
| Database | Supabase | PostgreSQL, real-time, easy auth |
| Database Dev | In-Memory | Fast testing, no setup required |
| TypeScript | Both ends | Type safety, fewer bugs |
| AI Analysis | Mock | Works out of box, easily replaceable |

---

This architecture ensures:
✅ Clean separation of concerns
✅ Easy to test and maintain
✅ Scalable design
✅ Flexible for enhancements
✅ Production-ready structure
