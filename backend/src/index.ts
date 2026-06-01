import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './config.js';
import { initSupabase, getSupabase } from './db.js';
import bugsRouter from './routes/bugs.js';
import uploadRouter from './routes/upload.js';
import excelRouter from './routes/excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Serve uploaded files with proper absolute path
app.use('/uploads', express.static(uploadsDir));
console.log(`📂 Serving uploads from: ${uploadsDir}`);

// Initialize database
initSupabase();
validateConfig();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Check uploads directory
app.get('/api/uploads-status', (req, res) => {
  const files = fs.readdirSync(uploadsDir);
  res.json({
    directory: uploadsDir,
    exists: fs.existsSync(uploadsDir),
    files: files,
    fileCount: files.length,
  });
});

// Routes
app.use('/api/bugs', bugsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/excel', excelRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = config.port as number;

app.listen(PORT, () => {
  const supabaseStatus = getSupabase() ? '✅ Connected' : '⚠️  Using Mock DB';
  console.log(`
╔════════════════════════════════════════════╗
║   AI Bug Reproduction Assistant API        ║
║   Server running on port ${PORT}              ║
║   Environment: ${config.nodeEnv}                ║
║   Database: ${supabaseStatus}                ║
╚════════════════════════════════════════════╝
  `);
  console.log(`
  📚 API Routes:
  GET  /api/health           - Health check
  GET  /api/bugs             - Get all bug reports
  GET  /api/bugs/:id         - Get single bug report
  POST /api/bugs             - Create new bug report
  POST /api/bugs/:id/analyze - Analyze bug with AI
  PATCH /api/bugs/:id        - Update bug report
  DELETE /api/bugs/:id       - Delete bug report
  POST /api/upload           - Upload screenshot
  POST /api/excel/insert     - Insert selected bugs into Excel workflow

  🌐 Frontend: http://localhost:3000
  `);
});
