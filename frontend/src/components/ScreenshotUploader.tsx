import { useState } from 'react';
import toast from 'react-hot-toast';
import { bugService } from '../services/bugService';
import { Upload, Loader } from 'lucide-react';

interface ScreenshotUploaderProps {
  onUpload: (url: string, screenshotId?: string) => void;
}

export default function ScreenshotUploader({ onUpload }: ScreenshotUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please upload an image or video file');
      return;
    }

    setPreviewType(file.type.startsWith('video/') ? 'video' : 'image');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsLoading(true);
    try {
      const response = await bugService.uploadScreenshot(file);
      onUpload(response.url, response.id);
      toast.success('Evidence uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload evidence');
      setPreview(null);
      setPreviewType(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
          {isLoading ? (
            <Loader className="w-8 h-8 mx-auto text-primary-600 animate-spin mb-2" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Click to upload screenshot or video</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF, MP4, MOV, WEBM up to 50MB</p>
            </>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </div>
      </label>
      {preview && (
        <div className="relative">
          {previewType === 'video' ? (
            <video src={preview} controls className="rounded-lg max-h-64 w-full object-contain" />
          ) : (
            <img src={preview} alt="Preview" className="rounded-lg max-h-64 w-full object-contain" />
          )}
          <button
            onClick={() => {
              setPreview(null);
              setPreviewType(null);
            }}
            className="mt-2 text-sm text-danger-600 hover:text-danger-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
