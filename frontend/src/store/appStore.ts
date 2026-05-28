import { create } from 'zustand';
import { BugReport, User } from '../types';

interface AppState {
  user: User | null;
  bugReports: BugReport[];
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setBugReports: (reports: BugReport[]) => void;
  addBugReport: (report: BugReport) => void;
  updateBugReport: (id: string, report: Partial<BugReport>) => void;
  removeBugReport: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  bugReports: [],
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setBugReports: (reports) => set({ bugReports: reports }),
  addBugReport: (report) => set((state) => ({
    bugReports: [report, ...state.bugReports],
  })),
  updateBugReport: (id, updates) => set((state) => ({
    bugReports: state.bugReports.map((report) =>
      report.id === id ? { ...report, ...updates } : report
    ),
  })),
  removeBugReport: (id) => set((state) => ({
    bugReports: state.bugReports.filter((report) => report.id !== id),
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
