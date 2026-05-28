import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BugReport } from '../types.js';
import { analyzeBugWithAI, generateBugId, getCurrentTimestamp, validateBugReport } from '../utils.js';
import { mockDatabase, getSupabase } from '../db.js';

// Helper function to attach screenshots to a bug
const attachScreenshotsToBug = async (bug: BugReport) => {
  const supabase = getSupabase();
  
  if (supabase) {
    try {
      const { data } = await supabase
        .from('screenshots')
        .select('*')
        .eq('bug_id', bug.id);
      return { ...bug, screenshots: data || [] };
    } catch (error) {
      console.warn('⚠️ Failed to fetch screenshots from Supabase:', error);
      const mockScreenshots = mockDatabase.screenshots.filter(s => s.bug_id === bug.id);
      return { ...bug, screenshots: mockScreenshots };
    }
  } else {
    const screenshots = mockDatabase.screenshots.filter(s => s.bug_id === bug.id);
    return { ...bug, screenshots };
  }
};

const router = Router();
const allowedStatuses: BugReport['status'][] = ['todo', 'inprogress', 'resolved', 'error'];

const toBugUpdatePayload = (bug: BugReport) => ({
  title: bug.title,
  description: bug.description,
  screenshot_url: bug.screenshot_url || null,
  severity: bug.severity,
  affected_module: bug.affected_module,
  reproduction_steps: bug.reproduction_steps,
  expected_result: bug.expected_result,
  actual_result: bug.actual_result,
  status: bug.status,
  updated_at: bug.updated_at,
});

const updateMockBug = (bug: BugReport) => {
  const index = mockDatabase.bugReports.findIndex(b => b.id === bug.id);
  if (index >= 0) {
    mockDatabase.bugReports[index] = { ...mockDatabase.bugReports[index], ...bug };
  }
};

// Get all bug reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let reports;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bug_reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        reports = data || [];
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        reports = mockDatabase.bugReports.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } else {
      reports = mockDatabase.bugReports.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Attach screenshots to each bug report
    const reportsWithScreenshots = await Promise.all(reports.map(attachScreenshotsToBug));
    res.json(reportsWithScreenshots);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bug reports' });
  }
});

// Get single bug report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let bug;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bug_reports')
          .select('*')
          .eq('id', req.params.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        bug = data || null;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
      }
    } else {
      bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
    }

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    // Attach screenshots to the bug report
    const bugWithScreenshots = await attachScreenshotsToBug(bug);
    res.json(bugWithScreenshots);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bug report' });
  }
});

// Create new bug report
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, screenshot_url, screenshot_id } = req.body;

    // Validate input
    const validation = validateBugReport(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const bugId = generateBugId();
    const newBug: BugReport = {
      id: bugId,
      title,
      description,
      screenshot_url,
      severity: 'medium',
      affected_module: 'Unknown',
      reproduction_steps: [],
      expected_result: '',
      actual_result: description,
      status: 'todo',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      user_id: 'default_user',
    };

    const supabase = getSupabase();
    
    if (supabase) {
      try {
        // Save bug report to Supabase
        const { error: bugError } = await supabase
          .from('bug_reports')
          .insert([newBug]);
        
        if (bugError) throw bugError;
        console.log('✅ Bug report saved to Supabase');

        // Handle screenshot if provided
        if (screenshot_id) {
          try {
            // Get screenshot from mock database and update with bug_id
            const screenshot = mockDatabase.screenshots.find(s => s.id === screenshot_id);
            if (screenshot) {
              screenshot.bug_id = bugId;
              screenshot.updated_at = getCurrentTimestamp();

              // Now insert the screenshot into Supabase with the correct bug_id
              const { error: screenshotError } = await supabase
                .from('screenshots')
                .insert([screenshot]);
              
              if (screenshotError) {
                console.warn('⚠️ Failed to save screenshot to Supabase:', screenshotError.message);
              } else {
                console.log('✅ Screenshot saved to Supabase');
                // Remove from mock database since it's now in Supabase
                mockDatabase.screenshots = mockDatabase.screenshots.filter(s => s.id !== screenshot_id);
              }
            }
          } catch (screenshotError) {
            console.warn('⚠️ Failed to process screenshot:', screenshotError);
          }
        }
      } catch (supabaseError) {
        console.warn('⚠️ Failed to save to Supabase, using mock database:', supabaseError);
        mockDatabase.bugReports.push(newBug);
        if (screenshot_id) {
          const screenshot = mockDatabase.screenshots.find(s => s.id === screenshot_id);
          if (screenshot) {
            screenshot.bug_id = bugId;
            screenshot.updated_at = getCurrentTimestamp();
          }
        }
      }
    } else {
      // Save to mock database
      mockDatabase.bugReports.push(newBug);
      console.log('📝 Bug report saved to mock database');

      // Handle screenshot if provided
      if (screenshot_id) {
        const screenshot = mockDatabase.screenshots.find(s => s.id === screenshot_id);
        if (screenshot) {
          screenshot.bug_id = bugId;
          screenshot.updated_at = getCurrentTimestamp();
        }
      }
    }

    // Attach screenshots and return
    const bugWithScreenshots = await attachScreenshotsToBug(newBug);
    res.status(201).json(bugWithScreenshots);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Failed to create bug report' });
  }
});

// Analyze bug (AI Analysis)
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let bug;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bug_reports')
          .select('*')
          .eq('id', req.params.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        bug = data || null;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
      }
    } else {
      bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
    }

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    // Analyze with the configured multimodal AI provider. Falls back to mock analysis if unavailable.
    const analysis = await analyzeBugWithAI({
      title: bug.title,
      description: bug.description,
      screenshot_url: bug.screenshot_url,
    });

    // Update bug with analysis results
    bug.severity = analysis.severity;
    bug.affected_module = analysis.affected_module;
    bug.reproduction_steps = analysis.reproduction_steps;
    bug.expected_result = analysis.expected_result;
    bug.actual_result = analysis.actual_result;
    bug.updated_at = getCurrentTimestamp();

    // Save to Supabase or mock database
    if (supabase) {
      const { data, error } = await supabase
        .from('bug_reports')
        .update(toBugUpdatePayload(bug))
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to save analysis to Supabase:', error);
        return res.status(500).json({ error: 'Analysis completed but failed to save report' });
      }

      bug = data;
    } else {
      updateMockBug(bug);
    }

    // Attach screenshots and return
    const bugWithScreenshots = await attachScreenshotsToBug(bug);
    res.json(bugWithScreenshots);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze bug' });
  }
});

// Update bug report
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let bug;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bug_reports')
          .select('*')
          .eq('id', req.params.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        bug = data || null;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase error, using mock database:', supabaseError);
        bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
      }
    } else {
      bug = mockDatabase.bugReports.find(b => b.id === req.params.id) || null;
    }

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    // Update only allowed fields
    const { title, description, severity, affected_module, status, reproduction_steps, expected_result, actual_result } = req.body;
    
    if (title) bug.title = title;
    if (description) bug.description = description;
    if (severity) bug.severity = severity;
    if (affected_module) bug.affected_module = affected_module;
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      bug.status = status;
    }
    if (reproduction_steps) bug.reproduction_steps = reproduction_steps;
    if (expected_result) bug.expected_result = expected_result;
    if (actual_result) bug.actual_result = actual_result;
    
    bug.updated_at = getCurrentTimestamp();

    // Save to Supabase or mock database
    if (supabase) {
      const { data, error } = await supabase
        .from('bug_reports')
        .update(toBugUpdatePayload(bug))
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update bug report in Supabase:', error);
        return res.status(500).json({ error: 'Failed to save bug report update' });
      }

      bug = data;
    } else {
      updateMockBug(bug);
    }

    // Attach screenshots and return
    const bugWithScreenshots = await attachScreenshotsToBug(bug);
    res.json(bugWithScreenshots);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update bug report' });
  }
});

// Delete bug report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const bugId = req.params.id;
    const supabase = getSupabase();

    // Delete from Supabase if connected
    if (supabase) {
      try {
        // Supabase will handle CASCADE delete of screenshots
        const { error } = await supabase
          .from('bug_reports')
          .delete()
          .eq('id', bugId);
        
        if (error) throw error;
        console.log('✅ Bug report deleted from Supabase');
        return res.json({ message: 'Bug report deleted' });
      } catch (supabaseError) {
        console.warn('⚠️ Failed to delete from Supabase, using mock database:', supabaseError);
      }
    }

    // Delete from mock database
    const index = mockDatabase.bugReports.findIndex(b => b.id === bugId);
    if (index === -1) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    // Delete associated screenshots
    mockDatabase.screenshots = mockDatabase.screenshots.filter(s => s.bug_id !== bugId);
    mockDatabase.bugReports.splice(index, 1);
    
    console.log('📝 Bug report deleted from mock database');
    res.json({ message: 'Bug report deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete bug report' });
  }
});

export default router;
