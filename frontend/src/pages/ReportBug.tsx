import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bugService } from '../services/bugService';
import ScreenshotUploader from '../components/ScreenshotUploader';
import { useAppStore } from '../store/appStore';

export default function ReportBug() {
  const navigate = useNavigate();
  const addBugReport = useAppStore(state => state.addBugReport);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotId, setScreenshotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const newBug = await bugService.createBugReport({
        title,
        description,
        screenshot_url: screenshotUrl,
        screenshot_id: screenshotId,
      });
      
      addBugReport(newBug);
      toast.success('Bug reported successfully!');
      navigate(`/bug/${newBug.id}`);
    } catch (error) {
      toast.error('Failed to report bug');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Report a Bug</h1>
        <p className="text-gray-600 mb-6">
          Provide details about the bug you found. Upload a screenshot or video to help the AI analyze it better.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the bug"
              className="input-field"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the bug, what were you doing when it happened?"
              className="input-field resize-none min-h-32"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshot or Video (Optional)
            </label>
            <ScreenshotUploader onUpload={(url, id) => {
              setScreenshotUrl(url);
              if (id) setScreenshotId(id);
            }} />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Bug Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
