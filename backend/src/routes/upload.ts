import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { UploadResponse, Screenshot } from '../types.js';
import { mockDatabase, getSupabase } from '../db.js';
import { getCurrentTimestamp } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Get the absolute path to the uploads directory
const uploadsPath = path.join(__dirname, '..', '..', config.uploadDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsPath}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only image and video files are allowed'));
    }
    cb(null, true);
  },
});

// Upload screenshot
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const screenshotId = uuidv4();
    let fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const storagePath = `bug-evidence/${screenshotId}-${req.file.filename}`;
        const fileBuffer = fs.readFileSync(req.file.path);
        const { error: uploadError } = await supabase.storage
          .from(config.supabaseBucket)
          .upload(storagePath, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(config.supabaseBucket)
          .getPublicUrl(storagePath);

        if (data.publicUrl) {
          fileUrl = data.publicUrl;
        }
      } catch (storageError) {
        console.warn('Failed to upload evidence to Supabase Storage, using local file URL:', storageError);
      }
    }
    
    console.log(`
📸 Screenshot Upload:
  File: ${req.file.originalname}
  Saved as: ${req.file.filename}
  Type: ${req.file.mimetype}
  Size: ${req.file.size} bytes
  Path: ${req.file.path}
  URL: ${fileUrl}
    `);

    const screenshot: Screenshot = {
      id: screenshotId,
      bug_id: '',  // Will be linked when bug is created
      filename: req.file.originalname,
      file_path: req.file.path,
      file_url: fileUrl,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: 'default_user',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };

    // Store temporarily until the bug is created and this evidence can be linked.
    mockDatabase.screenshots.push(screenshot);
    console.log('Evidence stored temporarily (will save metadata to Supabase when bug is created)');

    const response: UploadResponse = {
      id: screenshotId,
      url: fileUrl,
      path: req.file.path,
      filename: req.file.originalname,
      mime_type: req.file.mimetype,
    };

    res.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get screenshots for a bug
router.get('/bug/:bugId', async (req: Request, res: Response) => {
  try {
    const { bugId } = req.params;
    const supabase = getSupabase();

    let screenshots;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('screenshots')
          .select('*')
          .eq('bug_id', bugId);
        
        if (error) throw error;
        screenshots = data || [];
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        screenshots = mockDatabase.screenshots.filter(s => s.bug_id === bugId);
      }
    } else {
      screenshots = mockDatabase.screenshots.filter(s => s.bug_id === bugId);
    }

    res.json(screenshots);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch screenshots' });
  }
});

// Get screenshot by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let screenshot;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('screenshots')
          .select('*')
          .eq('id', req.params.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        screenshot = data || null;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        screenshot = mockDatabase.screenshots.find(s => s.id === req.params.id) || null;
      }
    } else {
      screenshot = mockDatabase.screenshots.find(s => s.id === req.params.id) || null;
    }

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    res.json(screenshot);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch screenshot' });
  }
});

export default router;
