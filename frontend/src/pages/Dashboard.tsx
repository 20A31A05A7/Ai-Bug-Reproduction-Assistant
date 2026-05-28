import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { bugService } from '../services/bugService';
import { useAppStore } from '../store/appStore';
import BugCard from '../components/BugCard';
import { Filter, Loader, RotateCcw } from 'lucide-react';
import { BugReport } from '../types';

type SeverityFilter = 'all' | BugReport['severity'];
type StatusFilter = 'all' | BugReport['status'];

const severityOptions: Array<{ value: SeverityFilter; label: string }> = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'error', label: 'Error' },
];

export default function Dashboard() {
  const { bugReports, isLoading, setIsLoading, setBugReports, updateBugReport, removeBugReport } = useAppStore();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadBugReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const reports = await bugService.getBugReports();
      setBugReports(reports);
    } catch (error) {
      toast.error('Failed to load bug reports');
    } finally {
      setIsLoading(false);
    }
  }, [setBugReports, setIsLoading]);

  useEffect(() => {
    loadBugReports();
  }, [loadBugReports]);

  const handleDeleteBug = async (bugId: string) => {
    const bug = bugReports.find((report) => report.id === bugId);
    const confirmed = window.confirm(`Delete "${bug?.title || 'this bug'}"?`);
    if (!confirmed) return;

    try {
      await bugService.deleteBugReport(bugId);
      removeBugReport(bugId);
      toast.success('Bug deleted');
    } catch (error) {
      toast.error('Failed to delete bug');
    }
  };

  const handleStatusChange = async (bugId: string, status: typeof bugReports[number]['status']) => {
    try {
      const updatedBug = await bugService.updateBugReport(bugId, { status });
      updateBugReport(bugId, updatedBug);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const todoCount = bugReports.filter(b => b.status === 'todo').length;
  const inProgressCount = bugReports.filter(b => b.status === 'inprogress').length;
  const resolvedCount = bugReports.filter(b => b.status === 'resolved').length;
  const criticalCount = bugReports.filter(b => b.severity === 'critical').length;
  const filteredBugReports = useMemo(() => {
    return bugReports.filter((bug) => {
      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
      return matchesSeverity && matchesStatus;
    });
  }, [bugReports, severityFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all reported bugs
        </p>
      </div>

      {bugReports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No bugs reported yet</p>
          <p className="text-gray-400 mt-2">
            Start by <a href="/report" className="text-primary-600 font-medium hover:underline">reporting a bug</a>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-primary-600">{bugReports.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Todo</p>
              <p className="text-3xl font-bold text-gray-700">{todoCount}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-success-500">{resolvedCount}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-danger-600">{criticalCount}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-900">{filteredBugReports.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{bugReports.length}</span> bugs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
                <div className="relative">
                  <label htmlFor="severity-filter" className="sr-only">
                    Severity
                  </label>
                  <select
                    id="severity-filter"
                    value={severityFilter}
                    onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 pr-9 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 lg:w-44"
                  >
                    {severityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label htmlFor="status-filter" className="sr-only">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 pr-9 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 lg:w-44"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSeverityFilter('all');
                    setStatusFilter('all');
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredBugReports.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-gray-500">No bugs match the selected filters</p>
              </div>
            ) : (
              filteredBugReports.map((bug) => (
                <BugCard
                  key={bug.id}
                  bug={bug}
                  onDelete={handleDeleteBug}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
