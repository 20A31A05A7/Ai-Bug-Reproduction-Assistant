import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'bug-screenshots',
  
  // AI API (Optional for future integration)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  claudeApiKey: process.env.CLAUDE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  
  // File Upload
  maxFileSize: Number(process.env.MAX_FILE_SIZE || 50 * 1024 * 1024), // default 50MB
  uploadDir: 'uploads',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

export const validateConfig = () => {
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.warn('⚠️  Supabase configuration not found. Some features may not work.');
  }
};
