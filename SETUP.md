# Development Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ (https://nodejs.org/)
- npm or yarn (comes with Node.js)

### Step 1: Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### Step 2: Configure Environment

Frontend environment is already configured (`.env.local`).

Backend environment is already configured (`.env`).

Optionally, update with your Supabase credentials if you want to use the cloud database.

### Step 3: Start Development Servers

**Terminal 1 - Frontend (React):**
```bash
cd frontend
npm run dev
```
- Opens at http://localhost:3000
- Hot reload enabled
- Tailwind CSS watch

**Terminal 2 - Backend (Express):**
```bash
cd backend
npm run dev
```
- Runs at http://localhost:5000
- Auto-restart on file changes (tsx watch)
- Mock database (in-memory)

### Step 4: Access the Application

Open your browser: http://localhost:3000

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled JavaScript
- `npm run seed` - Seed database with sample data (optional)

## Project Features

✅ **Frontend Features:**
- Dashboard with bug list
- Report new bugs
- Upload screenshots
- View bug details
- Real-time status updates

✅ **Backend Features:**
- RESTful API for bug management
- File upload handling
- Mock AI analysis (ready for real AI integration)
- In-memory database (can be replaced with Supabase)
- CORS configuration

## File Upload

Screenshots are stored in `backend/uploads/` directory.
In production, configure Supabase Storage instead.

## Mock Data

The backend uses an in-memory mock database. Data will be lost on server restart.
For persistence, set up Supabase PostgreSQL (see DATABASE_SETUP.sql).

## Troubleshooting

### Port already in use
If port 3000 or 5000 is already in use:
```bash
# Frontend (change port)
npm run dev -- --port 3001

# Backend (change in .env)
PORT=5001
```

### Module not found errors
```bash
# Clean install
rm -rf node_modules
npm install
```

### TypeScript errors
```bash
# Check types
npm run type-check

# Build to see full errors
npm run build
```

## Next Steps

1. ✅ Project setup complete
2. ⚡ Start both servers
3. 📸 Test uploading a screenshot
4. 🤖 Report a bug
5. 🔍 Click "Analyze Bug" to see AI analysis
6. 🚀 (Optional) Integrate real AI API and Supabase

## AI Integration (Optional)

To use real AI analysis instead of mock:

### Option 1: Claude API
1. Get key from https://console.anthropic.com/
2. Set `CLAUDE_API_KEY=sk-ant-...` in `.env`
3. Update `backend/src/utils.ts` to call Claude API

### Option 2: OpenAI API
1. Get key from https://platform.openai.com/
2. Set `OPENAI_API_KEY=sk-...` in `.env`
3. Update `backend/src/utils.ts` to call OpenAI API

Example:
```typescript
export const analyzeWithAI = async (request: AIPromptRequest) => {
  const prompt = generateBugAnalysisPrompt(request);
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: { 'x-api-key': config.claudeApiKey },
  });
  return parseAnalysisResult(response.data);
};
```

## Supabase Integration (Optional)

For cloud database:

1. Create account at https://supabase.com/
2. Create new project
3. Run SQL from `DATABASE_SETUP.sql` in Supabase SQL Editor
4. Copy project URL and API key
5. Update `.env` in backend:
   ```env
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```
6. Uncomment Supabase calls in `backend/src/db.ts`

## Testing

### Test Bug Report Creation
1. Go to http://localhost:3000/report
2. Fill in title and description
3. (Optional) Upload an image
4. Submit
5. Should see bug in dashboard

### Test AI Analysis
1. Click "Analyze Bug"
2. Should generate:
   - Reproduction steps
   - Severity
   - Module name
   - Expected vs actual result

## Performance Tips

- Frontend build: ~2-3 seconds
- Backend reload: ~1-2 seconds
- First API call: ~500ms
- Screenshot upload: Depends on file size (max 10MB)

## Getting Help

- Check console for error messages
- Verify both servers are running
- Ensure ports 3000 and 5000 are available
- Check .env files are properly configured
