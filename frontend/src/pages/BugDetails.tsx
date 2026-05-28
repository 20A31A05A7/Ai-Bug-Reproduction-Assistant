import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bugService } from '../services/bugService';
import { BugReport } from '../types';
import { Loader, AlertCircle, Pencil, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions: Array<{ value: BugReport['status']; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const isVideoEvidence = (mimeType?: string, url?: string) => {
  if (mimeType?.startsWith('video/')) return true;
  return /\.(mp4|mov|webm|avi)$/i.test(url || '');
};

function EvidencePreview({
  url,
  mimeType,
  filename,
  className,
}: {
  url: string;
  mimeType?: string;
  filename?: string;
  className: string;
}) {
  if (isVideoEvidence(mimeType, url)) {
    return (
      <video
        src={url}
        controls
        className={className}
        aria-label={filename || 'Bug video evidence'}
      />
    );
  }

  return (
    <img
      src={url}
      alt={filename || 'Bug screenshot'}
      className={className}
    />
  );
}

export default function BugDetails() {
  const { id } = useParams<{ id: string }>();
  const [bug, setBug] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  const loadBugDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await bugService.getBugReport(id);
      setBug(data);
      setDescriptionDraft(data.description);
    } catch (error) {
      toast.error('Failed to load bug details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBugDetails();
  }, [loadBugDetails]);

  const handleAnalyze = async () => {
    if (!id) return;
    try {
      setIsAnalyzing(true);
      const result = await bugService.analyzeBug(id);
      setBug(result);
      toast.success('Bug analysis completed');
    } catch (error) {
      toast.error('Failed to analyze bug');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (status: BugReport['status']) => {
    if (!id || !bug || bug.status === status) return;

    try {
      setIsUpdatingStatus(true);
      const updatedBug = await bugService.updateBugReport(id, { status });
      setBug(updatedBug);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const startEditingDescription = () => {
    if (!bug) return;
    setDescriptionDraft(bug.description);
    setIsEditingDescription(true);
  };

  const cancelEditingDescription = () => {
    setDescriptionDraft(bug?.description || '');
    setIsEditingDescription(false);
  };

  const handleDescriptionSave = async () => {
    if (!id || !bug) return;

    const trimmedDescription = descriptionDraft.trim();
    if (!trimmedDescription) {
      toast.error('Description cannot be empty');
      return;
    }

    if (trimmedDescription === bug.description) {
      setIsEditingDescription(false);
      return;
    }

    try {
      setIsSavingDescription(true);
      const updatedBug = await bugService.updateBugReport(id, { description: trimmedDescription });
      setBug(updatedBug);
      setDescriptionDraft(updatedBug.description);
      setIsEditingDescription(false);
      toast.success('Description updated');
    } catch (error) {
      toast.error('Failed to update description');
    } finally {
      setIsSavingDescription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-800">Bug not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-3xl font-bold text-gray-900">{bug.title}</h1>
            <div className="mt-2">
              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={descriptionDraft}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                    className="input-field min-h-32 resize-y"
                    maxLength={1000}
                    aria-label="Edit bug description"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDescriptionSave}
                      disabled={isSavingDescription}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingDescription ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingDescription}
                      disabled={isSavingDescription}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <span className="text-xs text-gray-500">{descriptionDraft.length}/1000</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 whitespace-pre-wrap text-gray-600">{bug.description}</p>
                  <button
                    type="button"
                    onClick={startEditingDescription}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Bug'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Severity</p>
            <p className="font-semibold text-lg capitalize text-danger-600">{bug.severity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Module</p>
            <p className="font-semibold text-lg">{bug.affected_module}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <select
              value={bug.status === 'error' ? 'todo' : bug.status}
              onChange={(event) => handleStatusChange(event.target.value as BugReport['status'])}
              disabled={isUpdatingStatus}
              className="input-field mt-1 py-1.5 capitalize"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {bug.screenshot_url && (!bug.screenshots || bug.screenshots.length === 0) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Visual Evidence</h2>
          <EvidencePreview
            url={bug.screenshot_url}
            className="rounded-lg max-h-96 w-full object-contain"
          />
        </div>
      )}

      {bug.screenshots && bug.screenshots.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Uploaded Evidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bug.screenshots.map((screenshot) => (
              <div key={screenshot.id} className="space-y-2">
                <EvidencePreview
                  url={screenshot.file_url}
                  mimeType={screenshot.mime_type}
                  filename={screenshot.filename}
                  className="rounded-lg max-h-64 w-full object-contain border border-gray-200"
                />
                <p className="text-sm text-gray-600">{screenshot.filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {bug.reproduction_steps.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Reproduction Steps</h2>
          <ol className="space-y-2">
            {bug.reproduction_steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {bug.expected_result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-green-50 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Expected Result</h3>
            <p className="text-green-800">{bug.expected_result}</p>
          </div>
          <div className="card bg-red-50 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Actual Result</h3>
            <p className="text-red-800">{bug.actual_result}</p>
          </div>
        </div>
      )}
    </div>
  );
}
