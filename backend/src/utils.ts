import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';
import { BugReport, AnalysisResult, AIPromptRequest } from './types.js';

/**
 * Generate a prompt for AI analysis of bug reports
 * This template can be used with Claude, OpenAI, or other AI providers
 */
export const generateBugAnalysisPrompt = (request: AIPromptRequest): string => {

  return `You are an expert QA engineer analyzing a bug report and its attached visual evidence, which may be a screenshot or a screen recording. First inspect the visual evidence briefly, then analyze every visible or audible component that may help reproduce the issue: page/screen name, layout regions, navigation, buttons, inputs, labels, icons, dialogs, error messages, selected states, disabled states,applied filters, loading states, timestamps, cursor/touch actions, motion, transitions, and any visible data values. For videos, review the sequence over time and identify each meaningful user action, UI state change, and failure point.
BUG TITLE: ${request.title}

DESCRIPTION: ${request.description}

${request.screenshot_url ? `VISUAL EVIDENCE: ${request.screenshot_url}` : 'No screenshot or video provided'}

Please analyze this bug and provide the following in JSON format:
{
  "severity": "low|medium|high|critical",
  "affected_module": "name of the affected module/component",
  "visual_summary": "brief summary of what is visible in the screenshot or video",
  "component_analysis": ["component or event 1: relevant observation", "component or event 2: relevant observation"],
  "reproduction_steps": ["step 1", "step 2", "step 3"],
  "expected_result": "what should happen",
  "actual_result": "what actually happened",
  "suggested_fix": "optional suggestion for fixing this bug"
}

Guidelines:
- Severity: critical=app crash/data loss, high=major feature broken, medium=feature partially broken, low=minor issues
- Keep visual_summary brief but specific
- In component_analysis, cover every important visible component or video event, including normal-looking components when they provide context
- Use the screenshot or video to identify visible UI state, page, labels, messages, selected controls, timeline of actions, and likely trigger
- Make reproduction steps specific, ordered, and actionable for a developer or QA engineer
- For videos, infer the exact user journey from the sequence of actions shown
- Include setup/context steps when visible or implied
- Make both expected and actual results clear and concise
- If evidence is uncertain, say what is inferred rather than inventing details
- The response must be valid JSON only, no markdown or extra text`;
};

const extractJsonObject = (text: string): AnalysisResult => {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  const match = withoutFence.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('AI response did not include a JSON object');
  }

  const parsed = JSON.parse(match[0]);
  const severities = ['low', 'medium', 'high', 'critical'];

  return {
    severity: severities.includes(parsed.severity) ? parsed.severity : 'medium',
    affected_module: String(parsed.affected_module || 'Unknown'),
    visual_summary: parsed.visual_summary ? String(parsed.visual_summary) : undefined,
    component_analysis: Array.isArray(parsed.component_analysis)
      ? parsed.component_analysis.map((item: unknown) => String(item)).filter(Boolean)
      : undefined,
    reproduction_steps: Array.isArray(parsed.reproduction_steps)
      ? parsed.reproduction_steps.map((step: unknown) => String(step)).filter(Boolean)
      : [],
    expected_result: String(parsed.expected_result || 'The feature should work as expected'),
    actual_result: String(parsed.actual_result || ''),
    suggested_fix: parsed.suggested_fix ? String(parsed.suggested_fix) : undefined,
  };
};

const getEvidenceInlineData = async (screenshotUrl?: string) => {
  if (!screenshotUrl) return null;

  try {
    const uploadsMarker = '/uploads/';
    const markerIndex = screenshotUrl.indexOf(uploadsMarker);

    if (markerIndex !== -1) {
      const filename = decodeURIComponent(screenshotUrl.slice(markerIndex + uploadsMarker.length));
      const safeFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), config.uploadDir, safeFilename);
      const data = await fs.readFile(filePath);
      return {
        mime_type: getMimeTypeFromFilename(safeFilename),
        data: data.toString('base64'),
      };
    }

    if (/^https?:\/\//i.test(screenshotUrl)) {
      const response = await fetch(screenshotUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch evidence: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return {
        mime_type: (response.headers.get('content-type') || 'image/png').split(';')[0],
        data: Buffer.from(arrayBuffer).toString('base64'),
      };
    }
  } catch (error) {
    console.warn('Failed to load evidence for AI analysis:', error);
  }

  return null;
};

const getMimeTypeFromFilename = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.avi') return 'video/x-msvideo';
  return 'image/png';
};

export const analyzeBugWithAI = async (request: AIPromptRequest): Promise<AnalysisResult> => {
  if (!config.geminiApiKey) {
    return mockAIAnalysis(request);
  }

  const prompt = generateBugAnalysisPrompt(request);
  const evidence = await getEvidenceInlineData(request.screenshot_url);
  const parts: any[] = [{ text: prompt }];

  if (evidence) {
    parts.unshift({
      inline_data: {
        mime_type: evidence.mime_type,
        data: evidence.data,
      },
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                severity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                },
                affected_module: { type: 'string' },
                visual_summary: { type: 'string' },
                component_analysis: {
                  type: 'array',
                  items: { type: 'string' },
                },
                reproduction_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
                expected_result: { type: 'string' },
                actual_result: { type: 'string' },
                suggested_fix: { type: 'string' },
              },
              required: [
                'severity',
                'affected_module',
                'visual_summary',
                'component_analysis',
                'reproduction_steps',
                'expected_result',
                'actual_result',
              ],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini response was empty');
    }

    const analysis = extractJsonObject(text);
    if (analysis.reproduction_steps.length === 0) {
      analysis.reproduction_steps = mockAIAnalysis(request).reproduction_steps;
    }
    return analysis;
  } catch (error) {
    console.warn('AI analysis failed, using mock analysis:', error);
    return mockAIAnalysis(request);
  }
};

/**
 * Mock AI analysis (for development without real AI API)
 * Replace this with actual API calls to Claude, OpenAI, etc.
 */
export const mockAIAnalysis = (request: AIPromptRequest): AnalysisResult => {
  const keywords = request.description.toLowerCase();
  
  // Determine severity based on keywords
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (keywords.includes('crash') || keywords.includes('error')) severity = 'critical';
  else if (keywords.includes('broken') || keywords.includes('not working')) severity = 'high';
  else if (keywords.includes('slow') || keywords.includes('minor')) severity = 'low';

  // Estimate affected module
  let module = 'Unknown';
  if (keywords.includes('login') || keywords.includes('auth')) module = 'Authentication';
  else if (keywords.includes('upload') || keywords.includes('file')) module = 'File Upload';
  else if (keywords.includes('button') || keywords.includes('ui') || keywords.includes('display')) module = 'UI/UX';
  else if (keywords.includes('search') || keywords.includes('filter')) module = 'Search';
  else if (keywords.includes('data') || keywords.includes('save')) module = 'Data Management';

  return {
    severity,
    affected_module: module,
    visual_summary: request.screenshot_url
      ? 'Visual evidence was provided but could not be analyzed by the AI provider.'
      : 'No visual evidence was provided.',
    component_analysis: request.screenshot_url
      ? ['AI analysis was unavailable, so component-level visual observations could not be generated.']
      : [],
    reproduction_steps: [
      'Navigate to the page/feature mentioned in the bug description',
      'Perform the action described: ' + request.description.substring(0, 50) + '...',
      'Observe the unexpected behavior',
      'Document the error message or visual state',
    ],
    expected_result: 'The feature should work as designed without errors',
    actual_result: request.description,
    suggested_fix: `Review the code related to ${module} module. Add proper error handling and validation.`,
  };
};

/**
 * Generate unique IDs for bug reports
 */
export const generateBugId = (): string => {
  return `bug_${uuidv4()}`;
};

/**
 * Format timestamp to ISO string
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Validate bug report data
 */
export const validateBugReport = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
