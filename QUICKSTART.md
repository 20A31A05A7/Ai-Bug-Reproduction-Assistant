# Getting Started with AI Bug Reproduction Assistant

## ✅ Project Setup Complete!

Your full-stack AI Bug Reproduction Assistant is now ready to use.

## 🚀 Quick Start (2 Terminal Windows)

### Terminal 1: Start Frontend (React)
```bash
cd frontend
npm run dev
```
✨ Opens at: http://localhost:3000

### Terminal 2: Start Backend (Express.js)
```bash
cd backend
npm run dev
```
🔌 Runs at: http://localhost:5000

## 📋 What's Included

### ✅ Frontend
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS styling
- 🔀 React Router navigation
- 📦 Zustand state management
- 🌐 Axios API client
- ⚡ Vite build system

**Pages:**
- Dashboard - View all bug reports
- Report Bug - Create new bug reports
- Bug Details - View and analyze individual bugs

### ✅ Backend
- 🔧 Express.js REST API
- 📤 File upload handling (Multer)
- 🤖 Mock AI analysis ready for real API
- 🗄️ In-memory database (can switch to Supabase)
- 📚 Full TypeScript support
- 🔄 Hot reload in development

**API Endpoints:**
- `GET /api/bugs` - List all bugs
- `POST /api/bugs` - Create bug report
- `GET /api/bugs/:id` - Get bug details
- `POST /api/bugs/:id/analyze` - Analyze with AI
- `POST /api/upload` - Upload screenshot

### ✅ Documentation
- `README.md` - Full project documentation
- `SETUP.md` - Detailed setup guide
- `DATABASE_SETUP.sql` - Supabase schema
- `.env.example` - Environment variables template

## 🎯 Try It Out

1. **Start both servers** (see Quick Start above)
2. **Open** http://localhost:3000
3. **Click** "Report Bug"
4. **Fill in** title and description
5. **Upload** a screenshot (optional)
6. **Click** "Submit Bug Report"
7. **Click** "Analyze Bug" to see AI analysis

## 🤖 How AI Analysis Works

The AI generates:
- **Severity Level**: Low, Medium, High, or Critical
- **Affected Module**: Which part of the app is affected
- **Reproduction Steps**: Numbered steps to reproduce
- **Expected Result**: What should happen
- **Actual Result**: What's actually happening

Currently using mock analysis. To enable real AI:

### Option 1: Claude API
1. Get API key: https://console.anthropic.com/
2. Add to `backend/.env`: `CLAUDE_API_KEY=sk-ant-...`
3. Uncomment Claude calls in `backend/src/utils.ts`

### Option 2: OpenAI API
1. Get API key: https://platform.openai.com/api-keys
2. Add to `backend/.env`: `OPENAI_API_KEY=sk-...`
3. Uncomment OpenAI calls in `backend/src/utils.ts`

## 💾 Database Options

### Current: In-Memory (Development)
- Data stored in RAM
- Lost on server restart
- Perfect for testing

### Optional: Supabase (Production)
1. Sign up: https://supabase.com/
2. Run `DATABASE_SETUP.sql` in Supabase
3. Add credentials to `backend/.env`
4. Uncomment Supabase calls in `backend/src/db.ts`

## 📁 File Structure

```
AI Bug Assistant/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service layer
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── config.ts        # Configuration
│   │   ├── db.ts            # Database setup
│   │   ├── types.ts         # TypeScript types
│   │   ├── utils.ts         # Utility & AI functions
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Environment variables
│
├── .github/
│   └── copilot-instructions.md
├── DATABASE_SETUP.sql       # Supabase schema
├── README.md                # Full documentation
└── SETUP.md                 # Detailed setup guide
```

## 🔧 Common Commands

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # Check TypeScript
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev     # Start with auto-reload
npm run build   # Compile TypeScript
npm run start   # Run compiled version
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Frontend on different port
npm run dev -- --port 3001

# Backend - edit backend/.env
PORT=5001
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Hot reload not working?**
- Save the file again
- Check console for errors
- Restart the dev server

## 📊 Dashboard Features

- 📈 **Stats Cards**: Total reports, completed, critical issues
- 🔍 **Bug Cards**: View title, description, status, severity
- 🎨 **Color Coded**: Severity levels shown with colors
- ⚡ **Real-time Updates**: Status updates after analysis

## 📸 Screenshot Upload

- Supported formats: PNG, JPG, GIF, WebP
- Max size: 10MB
- Preview before upload
- Stored in `backend/uploads/` (dev) or Supabase (prod)

## 🔐 Security Notes (Before Production)

- Add user authentication (Supabase Auth)
- Implement API rate limiting
- Add CSRF protection
- Validate all file uploads
- Use environment variables for secrets
- Enable HTTPS
- Add request logging

## 🚀 Next Steps

1. ✅ Project created
2. ✅ Dependencies installed
3. ⏭️ Start the servers (see Quick Start)
4. ⏭️ Test the app
5. ⏭️ (Optional) Integrate real AI API
6. ⏭️ (Optional) Connect to Supabase
7. ⏭️ Deploy to production

## 📚 Resources

- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- TypeScript Docs: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com
- Supabase Docs: https://supabase.com/docs
- Claude API: https://anthropic.com/docs
- OpenAI API: https://platform.openai.com/docs

## 💡 Tips

- **Check Console**: Browser console for frontend errors
- **Check Network Tab**: See API requests in DevTools
- **Terminal Output**: Server logs appear in terminal
- **Hot Reload**: Changes auto-refresh without restart
- **Type Safety**: TypeScript catches errors before runtime

## 🎉 You're All Set!

Open two terminal windows and run:

**Terminal 1:**
```bash
cd frontend && npm run dev
```

**Terminal 2:**
```bash
cd backend && npm run dev
```

Then visit: http://localhost:3000

Happy bug reporting! 🐛✨
