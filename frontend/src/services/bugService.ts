import axios from 'axios';
import { BugReport, UploadResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const bugService = {
  // Bug Report APIs
  async getBugReports(): Promise<BugReport[]> {
    const response = await axios.get(`${API_BASE}/bugs`);
    return response.data;
  },

  async getBugReport(id: string): Promise<BugReport> {
    const response = await axios.get(`${API_BASE}/bugs/${id}`);
    return response.data;
  },

  async createBugReport(data: {
    title: string;
    description: string;
    screenshot_url?: string;
    screenshot_id?: string;
  }): Promise<BugReport> {
    const response = await axios.post(`${API_BASE}/bugs`, data);
    return response.data;
  },

  async analyzeBug(bugId: string): Promise<BugReport> {
    const response = await axios.post(`${API_BASE}/bugs/${bugId}/analyze`);
    return response.data;
  },

  async updateBugReport(id: string, data: Partial<BugReport>): Promise<BugReport> {
    const response = await axios.patch(`${API_BASE}/bugs/${id}`, data);
    return response.data;
  },

  async deleteBugReport(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/bugs/${id}`);
  },

  // Upload APIs
  async uploadScreenshot(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
