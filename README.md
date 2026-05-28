# AI Bug Reproduction Assistant

A full-stack application that helps software teams automate bug reporting and analysis using AI.

## 📋 Overview

Software teams spend significant time asking clarifying questions about bugs:
- "How did this happen?"
- "Which page?"
- "Can you reproduce it again?"

This tool eliminates that back-and-forth by letting testers:
1. Upload a screenshot
2. Describe the bug
3. Get AI-generated analysis including:
   - Clear reproduction steps
   - Severity level
   - Affected module
   - Expected vs actual results

## 🚀 Features

- **Screenshot Upload**: Capture and upload bug screenshots
- **AI Analysis**: Automatic analysis of bug reports
- **Severity Detection**: AI determines bug severity (low/medium/high/critical)
- **Module Identification**: Automatically identifies affected modules
- **Reproduction Steps**: Generates clear, actionable reproduction steps
- **Dashboard**: View all reported bugs with status and severity
- **Real-time Updates**: Live status tracking of bug analysis

## 🛠 Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation
- Zustand for state management
- Axios for API calls

### Backend
- Express.js REST API
- TypeScript for type safety
- Multer for file uploads
- Supabase for database (PostgreSQL)
- Ready for Claude/OpenAI integration

### Database
- Supabase (PostgreSQL)
- Cloud file storage for screenshots

## 📦 Project Structure

```
AI Bug Assistant/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Main app component
│   │   ├── index.css        # Global styles
│   │   └── main.tsx         # Entry point
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── vite.config.ts       # Vite config
│   └── tailwind.config.js   # Tailwind config
│
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── config.ts        # Configuration
│   │   ├── db.ts            # Database setup
│   │   ├── types.ts         # TypeScript types
│   │   ├── utils.ts         # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── package.json         # Dependencies
│   └── tsconfig.json        # TypeScript config
│
├── .github/
│   └── copilot-instructions.md
│
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Git
- (Optional) Supabase account for production

### 1. Clone/Extract Project

```bash
cd "AI Bug Assistant"
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
```

Create a `.env.local` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Backend Setup

```bash
cd ../backend
npm install
npm run build
```

Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
CORS_ORIGIN=http://localhost:3000
```

See `.env.example` for all configuration options.

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run at: http://localhost:5000

## 📱 Usage

### Reporting a Bug

1. Click "Report Bug" in the navigation
2. Fill in the bug title and description
3. (Optional) Upload a screenshot
4. Click "Submit Bug Report"

### Analyzing Bugs

1. On the dashboard or bug details page
2. Click the "Analyze Bug" button
3. The AI will process the bug and generate:
   - Severity level
   - Affected module
   - Reproduction steps
   - Expected vs actual results

### Viewing Reports

1. Dashboard shows all reported bugs
2. Click any bug to view full details
3. View screenshots, reproduction steps, and status

## 🔌 API Endpoints

### Bug Reports
- `GET /api/bugs` - Get all bug reports
- `GET /api/bugs/:id` - Get single bug report
- `POST /api/bugs` - Create new bug report
- `POST /api/bugs/:id/analyze` - Analyze bug with AI
- `PATCH /api/bugs/:id` - Update bug report
- `DELETE /api/bugs/:id` - Delete bug report

### File Upload
- `POST /api/upload` - Upload screenshot (multipart/form-data)

### Health
- `GET /api/health` - Server health check

## 🤖 AI Integration

Currently uses mock analysis. To integrate with real AI:

### Option 1: OpenAI/GPT-4
1. Get API key from https://platform.openai.com/
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Update `src/utils.ts` to call OpenAI API

### Option 2: Claude/Anthropic
1. Get API key from https://console.anthropic.com/
2. Add to `.env`: `CLAUDE_API_KEY=sk-ant-...`
3. Update `src/utils.ts` to call Claude API

Example implementation in `src/utils.ts`:
```typescript
export const analyzeWithClaude = async (request: AIPromptRequest) => {
  const prompt = generateBugAnalysisPrompt(request);
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: { 'x-api-key': config.claudeApiKey },
  });
  // Parse and return analysis
};
```

## 🗄 Database Schema

### bug_reports table
```sql
CREATE TABLE bug_reports (
  id TEXT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  severity VARCHAR(20),
  affected_module VARCHAR(255),
  reproduction_steps JSON,
  expected_result TEXT,
  actual_result TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## 🚢 Deployment

### Deploy to Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy the dist folder to Vercel
```

### Deploy to Railway/Heroku (Backend)
```bash
cd backend
npm run build
# Set environment variables on hosting platform
# Deploy to your hosting provider
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🤝 Contributing

Contributions are welcome! Please:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests, please:
1. Check existing issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎯 Roadmap

- [ ] User authentication (Supabase Auth)
- [ ] Real Supabase integration
- [ ] Real AI analysis (Claude/OpenAI)
- [ ] Bug history and tracking
- [ ] Team collaboration features
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Browser extension for easier reporting
