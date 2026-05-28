export interface BugReport {
  id: string;
  title: string;
  description: string;
  screenshot_url?: string;
  screenshot_path?: string;
  screenshots?: Screenshot[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_module: string;
  reproduction_steps: string[];
  expected_result: string;
  actual_result: string;
  status: 'todo' | 'inprogress' | 'resolved' | 'error';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface AnalysisResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_module: string;
  visual_summary?: string;
  component_analysis?: string[];
  reproduction_steps: string[];
  expected_result: string;
  actual_result: string;
  suggested_fix?: string;
}

export interface Screenshot {
  id: string;
  bug_id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  id?: string;
  url: string;
  path: string;
  filename?: string;
  mime_type?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AIPromptRequest {
  title: string;
  description: string;
  screenshot_url?: string;
}
