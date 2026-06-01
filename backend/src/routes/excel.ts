import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { BugReport } from '../types.js';

const router = Router();

const excelColumns = [
  'ID',
  'Title',
  'Description',
  'Severity',
  'Affected Module',
  'Reproduction Steps',
  'Expected Result',
  'Actual Result',
  'Status',
  'Evidence URL',
];

const getEvidenceUrl = (bug: BugReport) => {
  return bug.screenshots?.[0]?.file_url || bug.screenshot_url || '';
};

const cleanCellValue = (value: unknown) => {
  return String(value ?? '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ').trim();
};

const cleanMultilineCellValue = (value: unknown) => {
  return String(value ?? '').replace(/\r?\n/g, '\n').replace(/\t/g, ' ').trim();
};

const formatReproductionStepsForExcel = (steps?: string[]) => {
  if (!steps || steps.length === 0) {
    return '';
  }

  return steps
    .map((step, index) => `${index + 1}. ${cleanMultilineCellValue(step)}`)
    .join('\n');
};

const bugToExcelRow = (bug: BugReport) => ({
  id: cleanCellValue(bug.id),
  title: cleanCellValue(bug.title),
  description: cleanCellValue(bug.description),
  severity: cleanCellValue(bug.severity),
  affected_module: cleanCellValue(bug.affected_module),
  reproduction_steps: formatReproductionStepsForExcel(bug.reproduction_steps),
  expected_result: cleanCellValue(bug.expected_result),
  actual_result: cleanCellValue(bug.actual_result),
  status: cleanCellValue(bug.status),
  evidence_url: cleanCellValue(getEvidenceUrl(bug)),
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    if (!config.powerAutomateExcelWebhookUrl) {
      return res.status(400).json({
        error: 'Excel insertion is not configured. Add POWER_AUTOMATE_EXCEL_WEBHOOK_URL to backend/.env.',
      });
    }

    const bugs = Array.isArray(req.body?.bugs) ? req.body.bugs as BugReport[] : [];
    if (bugs.length === 0) {
      return res.status(400).json({ error: 'No bugs selected for Excel insertion' });
    }

    const rows = bugs.map(bugToExcelRow);
    const response = await fetch(config.powerAutomateExcelWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        columns: excelColumns,
        rows,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      return res.status(502).json({
        error: 'Excel insertion webhook failed',
        details: responseText || response.statusText,
      });
    }

    res.json({
      inserted: rows.length,
      message: 'Rows sent to Excel insertion workflow',
    });
  } catch (error) {
    console.error('Excel insertion error:', error);
    res.status(500).json({ error: 'Failed to insert rows into Excel' });
  }
});

export default router;
