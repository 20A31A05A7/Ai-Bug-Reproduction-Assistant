import { BugReport } from '../types';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface BugCardProps {
  bug: BugReport;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: BugReport['status']) => void;
}

const severityConfig = {
  low: { color: 'bg-blue-50 border-blue-200', icon: CheckCircle, text: 'text-blue-700' },
  medium: { color: 'bg-yellow-50 border-yellow-200', icon: Clock, text: 'text-yellow-700' },
  high: { color: 'bg-orange-50 border-orange-200', icon: AlertTriangle, text: 'text-orange-700' },
  critical: { color: 'bg-red-50 border-red-200', icon: AlertCircle, text: 'text-red-700' },
};

const statusConfig = {
  todo: { badge: 'bg-gray-100 text-gray-800', label: 'Todo' },
  inprogress: { badge: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  resolved: { badge: 'bg-green-100 text-green-800', label: 'Resolved' },
  error: { badge: 'bg-red-100 text-red-800', label: 'Error' },
};

const statusOptions: Array<{ value: BugReport['status']; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function BugCard({ bug, onDelete, onStatusChange }: BugCardProps) {
  const config = severityConfig[bug.severity];
  const Icon = config.icon;
  const statusBadge = statusConfig[bug.status] || statusConfig.todo;

  return (
    <div className={`card border-l-4 ${config.color} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start gap-3">
        <Link to={`/bug/${bug.id}`} className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`w-5 h-5 mt-1 ${config.text}`} />
              <div>
                <h3 className="font-semibold text-gray-900">{bug.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{bug.description}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.badge}`}>
                {statusBadge.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.text} ${config.color}`}>
                {bug.severity}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="text-gray-600 font-medium">Module: {bug.affected_module}</span>
            <span>{new Date(bug.created_at).toLocaleDateString()}</span>
          </div>
        </Link>
        {onStatusChange && (
          <select
            value={bug.status === 'error' ? 'todo' : bug.status}
            onChange={(event) => onStatusChange(bug.id, event.target.value as BugReport['status'])}
            className="input-field w-36 py-1.5 text-sm"
            aria-label={`Update status for ${bug.title}`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(bug.id)}
            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${bug.title}`}
            title="Delete bug"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
