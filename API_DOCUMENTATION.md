# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently uses mock authentication (`user_id: default_user`). 
Add JWT or Supabase Auth for real implementation.

---

## Health Check

### Get Server Status
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## Bug Reports

### Get All Bug Reports
```http
GET /bugs
```

**Query Parameters:**
- None currently

**Response (200 OK):**
```json
[
  {
    "id": "bug_123e4567-e89b-12d3-a456-426614174000",
    "title": "Login button not working",
    "description": "When I click the login button, nothing happens",
    "screenshot_url": "/uploads/1234567890-123456789.png",
    "severity": "high",
    "affected_module": "Authentication",
    "reproduction_steps": [
      "Go to login page",
      "Enter credentials",
      "Click login button"
    ],
    "expected_result": "User should be logged in",
    "actual_result": "Nothing happens, button unresponsive",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z",
    "user_id": "default_user"
  }
]
```

---

### Get Single Bug Report
```http
GET /bugs/:id
```

**Path Parameters:**
- `id` (string) - Bug report ID

**Response (200 OK):**
```json
{
  "id": "bug_123e4567-e89b-12d3-a456-426614174000",
  "title": "Login button not working",
  ...
}
```

**Response (404 Not Found):**
```json
{
  "error": "Bug report not found"
}
```

---

### Create Bug Report
```http
POST /bugs
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "When I click the login button, nothing happens",
  "screenshot_url": "/uploads/1234567890-123456789.png"
}
```

**Request Body:**
- `title` (string, required) - Bug title (max 100 chars)
- `description` (string, required) - Bug description (max 1000 chars)
- `screenshot_url` (string, optional) - URL to uploaded screenshot

**Response (201 Created):**
```json
{
  "id": "bug_123e4567-e89b-12d3-a456-426614174000",
  "title": "Login button not working",
  "description": "When I click the login button, nothing happens",
  "screenshot_url": "/uploads/1234567890-123456789.png",
  "severity": "medium",
  "affected_module": "Unknown",
  "reproduction_steps": [],
  "expected_result": "",
  "actual_result": "When I click the login button, nothing happens",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "user_id": "default_user"
}
```

**Response (400 Bad Request):**
```json
{
  "errors": [
    "Title is required",
    "Description must be less than 1000 characters"
  ]
}
```

---

### Analyze Bug (AI Analysis)
```http
POST /bugs/:id/analyze
```

**Path Parameters:**
- `id` (string) - Bug report ID

**Request Body:**
None (uses bug data from database)

**Response (200 OK):**
```json
{
  "severity": "high",
  "affected_module": "Authentication",
  "reproduction_steps": [
    "Navigate to the login page",
    "Enter valid username and password",
    "Click the login button",
    "Observe that the button doesn't respond"
  ],
  "expected_result": "User should be logged in and redirected to dashboard",
  "actual_result": "When I click the login button, nothing happens",
  "suggested_fix": "Review the code related to Authentication module. Add proper event handler to the login button and error handling."
}
```

**Bug Updated:**
The bug report in the database is updated with the analysis results:
```json
{
  "id": "bug_123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "severity": "high",
  "affected_module": "Authentication",
  "reproduction_steps": [...],
  "expected_result": "...",
  "actual_result": "..."
}
```

**Response (404 Not Found):**
```json
{
  "error": "Bug report not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to analyze bug"
}
```

---

### Update Bug Report
```http
PATCH /bugs/:id
Content-Type: application/json

{
  "status": "in progress",
  "severity": "critical"
}
```

**Path Parameters:**
- `id` (string) - Bug report ID

**Request Body:**
Any of the following fields (all optional):
- `title` (string)
- `description` (string)
- `severity` ("low" | "medium" | "high" | "critical")
- `affected_module` (string)
- `status` ("pending" | "analyzing" | "completed" | "error")
- `reproduction_steps` (string[])
- `expected_result` (string)
- `actual_result` (string)

**Response (200 OK):**
```json
{
  "id": "bug_123e4567-e89b-12d3-a456-426614174000",
  ...
}
```

**Response (404 Not Found):**
```json
{
  "error": "Bug report not found"
}
```

---

### Delete Bug Report
```http
DELETE /bugs/:id
```

**Path Parameters:**
- `id` (string) - Bug report ID

**Response (200 OK):**
```json
{
  "message": "Bug report deleted"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Bug report not found"
}
```

---

## File Upload

### Upload Screenshot
```http
POST /upload
Content-Type: multipart/form-data

file=<image_file>
```

**Form Data:**
- `file` (File, required) - Image file (PNG, JPG, GIF, WebP)
  - Max size: 10MB
  - Must be an image

**Response (200 OK):**
```json
{
  "url": "/uploads/1704992400000-123456789.png",
  "path": "uploads/1704992400000-123456789.png"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "No file uploaded"
}
```

**Response (413 Payload Too Large):**
```json
{
  "error": "File size exceeds limit"
}
```

---

## Data Models

### Bug Report
```typescript
interface BugReport {
  id: string;                          // Unique ID (bug_<uuid>)
  title: string;                       // Bug title
  description: string;                 // Full description
  screenshot_url?: string;             // URL to screenshot
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_module: string;             // Component/module name
  reproduction_steps: string[];        // Step-by-step reproduction
  expected_result: string;             // What should happen
  actual_result: string;               // What actually happens
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  created_at: string;                  // ISO 8601 timestamp
  updated_at: string;                  // ISO 8601 timestamp
  user_id: string;                     // User who reported the bug
}
```

### Analysis Result
```typescript
interface AnalysisResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_module: string;
  reproduction_steps: string[];
  expected_result: string;
  actual_result: string;
  suggested_fix?: string;
}
```

### Upload Response
```typescript
interface UploadResponse {
  url: string;   // Relative URL to access the file
  path: string;  // File system path
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request body or parameters
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - File size exceeds limit
- `500 Internal Server Error` - Server error

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000` (development)

Configure in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

---

## Rate Limiting

Currently not implemented. Add rate limiting before production using middleware like `express-rate-limit`.

---

## Authentication

Current implementation uses a default user ID. For production:

1. Add JWT tokens
2. Or use Supabase Auth
3. Verify user on each request
4. Include `user_id` in request context

Example with JWT:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Example Requests

### Create Bug Report and Analyze
```bash
# 1. Upload screenshot
curl -X POST http://localhost:5000/api/upload \
  -F "file=@screenshot.png"

# Returns: { "url": "/uploads/...", "path": "..." }

# 2. Create bug report
curl -X POST http://localhost:5000/api/bugs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login not working",
    "description": "The login button doesn't respond",
    "screenshot_url": "/uploads/..."
  }'

# Returns: { "id": "bug_...", "status": "pending", ... }

# 3. Analyze the bug
curl -X POST http://localhost:5000/api/bugs/bug_.../analyze

# Returns: { "severity": "high", "reproduction_steps": [...], ... }
```

### JavaScript Fetch Examples
```javascript
// Get all bugs
fetch('http://localhost:5000/api/bugs')
  .then(res => res.json())
  .then(data => console.log(data));

// Create bug
fetch('http://localhost:5000/api/bugs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Button broken',
    description: 'Not clickable'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// Analyze bug
fetch(`http://localhost:5000/api/bugs/${bugId}/analyze`, {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Testing Tools

- **Postman**: Import API endpoints
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

Example REST Client file (`.rest`):
```http
### Health check
GET http://localhost:5000/api/health

### Get all bugs
GET http://localhost:5000/api/bugs

### Create bug
POST http://localhost:5000/api/bugs
Content-Type: application/json

{
  "title": "Test bug",
  "description": "This is a test"
}
```
